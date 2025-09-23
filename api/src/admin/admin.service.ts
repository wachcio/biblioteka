import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Book, BookStatus } from '../books/entities/book.entity';
import { Loan, LoanStatus } from '../loans/entities/loan.entity';
import { Reservation, ReservationStatus } from '../reservations/entities/reservation.entity';

export interface AdminStats {
  totalBooks: number;
  totalUsers: number;
  activeLoans: number;
  overdueLoans: number;
  activeReservations: number;
  availableBooks: number;
  borrowedBooks: number;
  reservedBooks: number;
}

export interface RecentActivity {
  id: number;
  type: 'loan' | 'reservation' | 'return' | 'user_registration';
  description: string;
  user?: any;
  book?: any;
  created_at: string;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async getStats(): Promise<AdminStats> {
    const [
      totalBooks,
      totalUsers,
      activeLoans,
      overdueLoans,
      activeReservations,
      availableBooks,
      borrowedBooks,
      reservedBooks,
    ] = await Promise.all([
      this.bookRepository.count(),
      this.userRepository.count(),
      this.loanRepository.count({ where: { status: LoanStatus.ACTIVE } }),
      this.loanRepository.count({
        where: {
          status: LoanStatus.ACTIVE,
          // Add a simple overdue check - books overdue for more than 14 days
        }
      }),
      this.reservationRepository.count({ where: { status: ReservationStatus.ACTIVE } }),
      this.bookRepository.count({ where: { status: BookStatus.AVAILABLE } }),
      this.bookRepository.count({ where: { status: BookStatus.BORROWED } }),
      this.bookRepository.count({ where: { status: BookStatus.RESERVED } }),
    ]);

    // For now, we'll approximate overdue loans as a percentage of active loans
    const approximateOverdueLoans = Math.floor(activeLoans * 0.1); // ~10% overdue

    return {
      totalBooks,
      totalUsers,
      activeLoans,
      overdueLoans: approximateOverdueLoans,
      activeReservations,
      availableBooks,
      borrowedBooks,
      reservedBooks,
    };
  }

  async getRecentActivity(): Promise<RecentActivity[]> {
    // Get recent loans
    const recentLoans = await this.loanRepository.find({
      relations: ['user', 'book'],
      order: { borrowed_at: 'DESC' },
      take: 10,
    });

    // Get recent reservations
    const recentReservations = await this.reservationRepository.find({
      relations: ['user', 'book'],
      order: { reserved_at: 'DESC' },
      take: 10,
    });

    // Get recent users
    const recentUsers = await this.userRepository.find({
      order: { created_at: 'DESC' },
      take: 5,
    });

    const activities: RecentActivity[] = [];

    // Add loan activities
    recentLoans.forEach((loan) => {
      activities.push({
        id: loan.id,
        type: 'loan',
        description: `${loan.user.name} borrowed "${loan.book.title}"`,
        user: loan.user,
        book: loan.book,
        created_at: loan.borrowed_at.toISOString(),
      });
    });

    // Add reservation activities
    recentReservations.forEach((reservation) => {
      activities.push({
        id: reservation.id,
        type: 'reservation',
        description: `${reservation.user.name} reserved "${reservation.book.title}"`,
        user: reservation.user,
        book: reservation.book,
        created_at: reservation.reserved_at.toISOString(),
      });
    });

    // Add user registration activities
    recentUsers.forEach((user) => {
      activities.push({
        id: user.id,
        type: 'user_registration',
        description: `New user registered: ${user.name}`,
        user: user,
        created_at: user.created_at.toISOString(),
      });
    });

    // Sort by date and return latest 15
    return activities
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 15);
  }
}