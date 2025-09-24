import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan, LoanStatus } from './entities/loan.entity';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { Book, BookStatus } from '../books/entities/book.entity';
import { User } from '../users/entities/user.entity';
import { Reservation, ReservationStatus } from '../reservations/entities/reservation.entity';

export interface LoanSearchParams {
  userId?: number;
  bookId?: number;
  adminId?: number;
  status?: LoanStatus;
  overdue?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async create(createLoanDto: CreateLoanDto, adminId: number): Promise<Loan> {
    const { user_id, book_id, due_date } = createLoanDto;

    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: user_id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if book exists and is available or reserved
    const book = await this.bookRepository.findOne({ where: { id: book_id } });
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (book.status === BookStatus.BORROWED) {
      throw new BadRequestException('Book is already borrowed');
    }

    // Check if user already has an active loan for this book
    const existingLoan = await this.loanRepository.findOne({
      where: {
        user_id,
        book_id,
        status: LoanStatus.ACTIVE,
      },
    });

    if (existingLoan) {
      throw new BadRequestException('User already has an active loan for this book');
    }

    // Check if user has reached loan limit (e.g., 3 active loans)
    const activeLoansCount = await this.loanRepository.count({
      where: {
        user_id,
        status: LoanStatus.ACTIVE,
      },
    });

    if (activeLoansCount >= 3) {
      throw new BadRequestException('User has reached the maximum number of active loans (3)');
    }

    // If book is reserved, check if it's reserved by the same user
    if (book.status === BookStatus.RESERVED) {
      const reservation = await this.reservationRepository.findOne({
        where: {
          book_id,
          user_id,
          status: ReservationStatus.ACTIVE,
        },
      });

      if (!reservation) {
        throw new BadRequestException('Book is reserved by another user');
      }

      // Convert reservation to loan
      await this.reservationRepository.update(reservation.id, {
        status: ReservationStatus.CONVERTED,
      });
    }

    // Create loan
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 14); // 14 days from now

    const loan = this.loanRepository.create({
      user_id,
      book_id,
      admin_id: adminId,
      due_date: due_date ? new Date(due_date) : defaultDueDate,
      status: LoanStatus.ACTIVE,
    });

    const savedLoan = await this.loanRepository.save(loan);

    // Update book status to borrowed
    await this.bookRepository.update(book_id, { status: BookStatus.BORROWED });

    return this.findById(savedLoan.id);
  }

  async findAll(params: LoanSearchParams = {}): Promise<{ loans: Loan[]; total: number }> {
    const { userId, bookId, adminId, status, overdue, page = 1, limit = 20 } = params;

    const query = this.loanRepository.createQueryBuilder('loan')
      .leftJoinAndSelect('loan.user', 'user')
      .leftJoinAndSelect('loan.book', 'book')
      .leftJoinAndSelect('loan.admin', 'admin')
      .leftJoinAndSelect('book.bookAuthors', 'bookAuthor')
      .leftJoinAndSelect('bookAuthor.author', 'author');

    if (userId) {
      query.andWhere('loan.user_id = :userId', { userId });
    }

    if (bookId) {
      query.andWhere('loan.book_id = :bookId', { bookId });
    }

    if (adminId) {
      query.andWhere('loan.admin_id = :adminId', { adminId });
    }

    if (status) {
      query.andWhere('loan.status = :status', { status });
    }

    if (overdue === true) {
      query.andWhere('loan.due_date < :now AND loan.status = :activeStatus', {
        now: new Date(),
        activeStatus: LoanStatus.ACTIVE,
      });
    }

    query
      .orderBy('loan.borrowed_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [loans, total] = await query.getManyAndCount();

    return { loans, total };
  }

  async findById(id: number): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id },
      relations: [
        'user',
        'book',
        'admin',
        'book.bookAuthors',
        'book.bookAuthors.author'
      ],
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    return loan;
  }

  async findByUserId(userId: number): Promise<Loan[]> {
    return this.loanRepository.find({
      where: { user_id: userId },
      relations: [
        'book',
        'book.bookAuthors',
        'book.bookAuthors.author',
        'admin'
      ],
      order: { borrowed_at: 'DESC' },
    });
  }

  async update(id: number, updateLoanDto: UpdateLoanDto): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id },
      relations: ['book'],
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    const oldStatus = loan.status;

    // If returning the book, set returned_at date
    if (updateLoanDto.status === LoanStatus.RETURNED && oldStatus !== LoanStatus.RETURNED) {
      updateLoanDto.returned_at = new Date().toISOString();
    }

    await this.loanRepository.update(id, updateLoanDto);

    // If loan is being returned, update book status back to available
    if (updateLoanDto.status === LoanStatus.RETURNED && oldStatus !== LoanStatus.RETURNED) {
      await this.bookRepository.update(loan.book_id, { status: BookStatus.AVAILABLE });
    }

    return this.findById(id);
  }

  async returnBook(id: number): Promise<Loan> {
    return this.update(id, {
      status: LoanStatus.RETURNED,
      returned_at: new Date().toISOString(),
    });
  }

  async extendLoan(id: number, newDueDate: string): Promise<Loan> {
    const loan = await this.loanRepository.findOne({ where: { id } });
    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    if (loan.status !== LoanStatus.ACTIVE) {
      throw new BadRequestException('Only active loans can be extended');
    }

    // Check if the new due date is in the future
    const dueDate = new Date(newDueDate);
    if (dueDate <= new Date()) {
      throw new BadRequestException('Due date must be in the future');
    }

    // Check if the extension is reasonable (e.g., max 30 days from current due date)
    const maxDueDate = new Date(loan.due_date);
    maxDueDate.setDate(maxDueDate.getDate() + 30);
    if (dueDate > maxDueDate) {
      throw new BadRequestException('Due date cannot be more than 30 days from current due date');
    }

    return this.update(id, { due_date: newDueDate });
  }

  async checkOverdueLoans(): Promise<void> {
    const overdueLoans = await this.loanRepository.find({
      where: {
        status: LoanStatus.ACTIVE,
      },
    });

    const now = new Date();
    const overdueIds: number[] = [];

    for (const loan of overdueLoans) {
      if (loan.due_date < now) {
        overdueIds.push(loan.id);
      }
    }

    if (overdueIds.length > 0) {
      await this.loanRepository.update(overdueIds, { status: LoanStatus.OVERDUE });
    }
  }

  async getOverdueLoans(): Promise<Loan[]> {
    const result = await this.findAll({ status: LoanStatus.OVERDUE });
    return result.loans;
  }

  async getUserOverdueLoans(userId: number): Promise<Loan[]> {
    const result = await this.findAll({ userId, overdue: true });
    return result.loans;
  }

  async getLoanStats() {
    const totalLoans = await this.loanRepository.count();
    const activeLoans = await this.loanRepository.count({ where: { status: LoanStatus.ACTIVE } });
    const overdueLoans = await this.loanRepository.count({ where: { status: LoanStatus.OVERDUE } });
    const returnedLoans = await this.loanRepository.count({ where: { status: LoanStatus.RETURNED } });

    // Calculate average loan duration for returned loans
    const returnedLoansWithDates = await this.loanRepository.find({
      where: { status: LoanStatus.RETURNED },
      select: ['borrowed_at', 'returned_at'],
    });

    let averageLoanDuration = 0;
    if (returnedLoansWithDates.length > 0) {
      const totalDuration = returnedLoansWithDates.reduce((sum, loan) => {
        const duration = new Date(loan.returned_at).getTime() - new Date(loan.borrowed_at).getTime();
        return sum + duration;
      }, 0);
      averageLoanDuration = Math.round(totalDuration / returnedLoansWithDates.length / (1000 * 60 * 60 * 24)); // in days
    }

    return {
      totalLoans,
      activeLoans,
      overdueLoans,
      returnedLoans,
      averageLoanDuration,
    };
  }
}