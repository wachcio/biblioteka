import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Book, BookStatus } from '../books/entities/book.entity';
import { User, UserRole } from '../users/entities/user.entity';

export interface ReservationSearchParams {
  userId?: number;
  bookId?: number;
  status?: ReservationStatus;
  page?: number;
  limit?: number;
}

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createReservationDto: CreateReservationDto, userId: number): Promise<Reservation> {
    const { book_id, expires_at } = createReservationDto;

    // Check if book exists and is available
    const book = await this.bookRepository.findOne({ where: { id: book_id } });
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (book.status !== BookStatus.AVAILABLE) {
      throw new BadRequestException('Book is not available for reservation');
    }

    // Check if user already has an active reservation for this book
    const existingReservation = await this.reservationRepository.findOne({
      where: {
        user_id: userId,
        book_id,
        status: ReservationStatus.ACTIVE,
      },
    });

    if (existingReservation) {
      throw new BadRequestException('You already have an active reservation for this book');
    }

    // Check if user has reached reservation limit (e.g., 5 active reservations)
    const activeReservationsCount = await this.reservationRepository.count({
      where: {
        user_id: userId,
        status: ReservationStatus.ACTIVE,
      },
    });

    if (activeReservationsCount >= 5) {
      throw new BadRequestException('You have reached the maximum number of active reservations (5)');
    }

    // Create reservation
    const defaultExpiresAt = new Date();
    defaultExpiresAt.setDate(defaultExpiresAt.getDate() + 7); // 7 days from now

    const reservation = this.reservationRepository.create({
      user_id: userId,
      book_id,
      expires_at: expires_at ? new Date(expires_at) : defaultExpiresAt,
      status: ReservationStatus.ACTIVE,
    });

    const savedReservation = await this.reservationRepository.save(reservation);

    // Update book status to reserved
    await this.bookRepository.update(book_id, { status: BookStatus.RESERVED });

    return this.findById(savedReservation.id);
  }

  async findAll(params: ReservationSearchParams = {}): Promise<{ reservations: Reservation[]; total: number }> {
    const { userId, bookId, status, page = 1, limit = 20 } = params;

    const query = this.reservationRepository.createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.user', 'user')
      .leftJoinAndSelect('reservation.book', 'book')
      .leftJoinAndSelect('book.bookAuthors', 'bookAuthor')
      .leftJoinAndSelect('bookAuthor.author', 'author');

    if (userId) {
      query.andWhere('reservation.user_id = :userId', { userId });
    }

    if (bookId) {
      query.andWhere('reservation.book_id = :bookId', { bookId });
    }

    if (status) {
      query.andWhere('reservation.status = :status', { status });
    }

    query
      .orderBy('reservation.reserved_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [reservations, total] = await query.getManyAndCount();

    return { reservations, total };
  }

  async findById(id: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: [
        'user',
        'book',
        'book.bookAuthors',
        'book.bookAuthors.author'
      ],
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return reservation;
  }

  async findByUserId(userId: number): Promise<Reservation[]> {
    return this.reservationRepository.find({
      where: { user_id: userId },
      relations: [
        'book',
        'book.bookAuthors',
        'book.bookAuthors.author'
      ],
      order: { reserved_at: 'DESC' },
    });
  }

  async update(id: number, updateReservationDto: UpdateReservationDto, currentUser: User): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['user', 'book'],
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // Users can only update their own reservations (cancel only)
    // Admins can update any reservation
    if (currentUser.role !== UserRole.ADMIN && reservation.user_id !== currentUser.id) {
      throw new ForbiddenException('You can only modify your own reservations');
    }

    // If user is not admin, they can only cancel their reservation
    if (currentUser.role !== UserRole.ADMIN && updateReservationDto.status && updateReservationDto.status !== ReservationStatus.CANCELLED) {
      throw new ForbiddenException('Users can only cancel their own reservations');
    }

    const oldStatus = reservation.status;
    await this.reservationRepository.update(id, updateReservationDto);

    // If reservation is being cancelled or expired, update book status back to available
    if (updateReservationDto.status &&
        (updateReservationDto.status === ReservationStatus.CANCELLED || updateReservationDto.status === ReservationStatus.EXPIRED) &&
        oldStatus === ReservationStatus.ACTIVE) {
      await this.bookRepository.update(reservation.book_id, { status: BookStatus.AVAILABLE });
    }

    return this.findById(id);
  }

  async cancel(id: number, userId: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found or does not belong to you');
    }

    if (reservation.status !== ReservationStatus.ACTIVE) {
      throw new BadRequestException('Only active reservations can be cancelled');
    }

    return this.update(id, { status: ReservationStatus.CANCELLED }, { id: userId, role: UserRole.USER } as User);
  }

  async convertToLoan(id: number): Promise<void> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.status !== ReservationStatus.ACTIVE) {
      throw new BadRequestException('Only active reservations can be converted to loans');
    }

    await this.reservationRepository.update(id, { status: ReservationStatus.CONVERTED });
  }

  async checkExpiredReservations(): Promise<void> {
    const expiredReservations = await this.reservationRepository.find({
      where: {
        status: ReservationStatus.ACTIVE,
      },
    });

    const now = new Date();
    const expiredIds: number[] = [];
    const bookIdsToUpdate: number[] = [];

    for (const reservation of expiredReservations) {
      if (reservation.expires_at && reservation.expires_at < now) {
        expiredIds.push(reservation.id);
        bookIdsToUpdate.push(reservation.book_id);
      }
    }

    if (expiredIds.length > 0) {
      // Update expired reservations
      await this.reservationRepository.update(expiredIds, { status: ReservationStatus.EXPIRED });

      // Update book statuses back to available
      for (const bookId of bookIdsToUpdate) {
        await this.bookRepository.update(bookId, { status: BookStatus.AVAILABLE });
      }
    }
  }

  async getReservationStats() {
    const totalReservations = await this.reservationRepository.count();
    const activeReservations = await this.reservationRepository.count({ where: { status: ReservationStatus.ACTIVE } });
    const expiredReservations = await this.reservationRepository.count({ where: { status: ReservationStatus.EXPIRED } });
    const convertedReservations = await this.reservationRepository.count({ where: { status: ReservationStatus.CONVERTED } });

    return {
      totalReservations,
      activeReservations,
      expiredReservations,
      convertedReservations,
    };
  }
}