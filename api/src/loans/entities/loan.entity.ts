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

export enum LoanStatus {
  ACTIVE = 'active',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
}

@Entity('loans')
@Index(['user_id', 'book_id', 'status'])
export class Loan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  user_id: number;

  @Column({ type: 'int', nullable: false })
  book_id: number;

  @Column({ type: 'int', nullable: false })
  admin_id: number;

  @CreateDateColumn({ type: 'timestamp' })
  borrowed_at: Date;

  @Column({ type: 'timestamp', nullable: false })
  due_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  returned_at: Date;

  @Column({
    type: 'enum',
    enum: LoanStatus,
    nullable: false,
    default: LoanStatus.ACTIVE,
  })
  status: LoanStatus;

  @ManyToOne(() => User, (user) => user.loans)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Book, (book) => book.loans)
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @ManyToOne(() => User, (admin) => admin.administeredLoans)
  @JoinColumn({ name: 'admin_id' })
  admin: User;
}