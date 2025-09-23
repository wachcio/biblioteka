import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Book } from '../../books/entities/book.entity';

export enum ReservationStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  CONVERTED = 'converted',
}

@Entity('reservations')
@Index(['user_id', 'book_id', 'status'])
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  user_id: number;

  @Column({ type: 'int', nullable: false })
  book_id: number;

  @CreateDateColumn({ type: 'timestamp' })
  reserved_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    nullable: false,
    default: ReservationStatus.ACTIVE,
  })
  status: ReservationStatus;

  @ManyToOne(() => User, (user) => user.reservations)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Book, (book) => book.reservations)
  @JoinColumn({ name: 'book_id' })
  book: Book;
}