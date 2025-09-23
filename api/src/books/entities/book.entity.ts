import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { BookAuthor } from './book-author.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { Loan } from '../../loans/entities/loan.entity';

export enum BookStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  BORROWED = 'borrowed',
}

@Entity('books')
@Index(['title'])
@Index(['isbn'], { unique: true })
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'int', nullable: true })
  year: number;

  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  isbn: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cover_url: string;

  @Column({
    type: 'enum',
    enum: BookStatus,
    nullable: false,
    default: BookStatus.AVAILABLE,
  })
  status: BookStatus;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @OneToMany(() => BookAuthor, (bookAuthor) => bookAuthor.book, {
    cascade: true,
  })
  bookAuthors: BookAuthor[];

  @OneToMany(() => Reservation, (reservation) => reservation.book)
  reservations: Reservation[];

  @OneToMany(() => Loan, (loan) => loan.book)
  loans: Loan[];
}