import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Book, BookStatus } from './entities/book.entity';
import { BookAuthor } from './entities/book-author.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { AuthorsService } from '../authors/authors.service';

export interface BookSearchParams {
  search?: string;
  category?: string;
  status?: BookStatus;
  authorId?: number;
  page?: number;
  limit?: number;
}

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(BookAuthor)
    private readonly bookAuthorRepository: Repository<BookAuthor>,
    private readonly authorsService: AuthorsService,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const { authorIds, ...bookData } = createBookDto;

    // Verify that all authors exist
    const authors = await this.authorsService.findByIds(authorIds);
    if (authors.length !== authorIds.length) {
      throw new BadRequestException('One or more authors not found');
    }

    // Create book
    const book = this.bookRepository.create({
      ...bookData,
      status: BookStatus.AVAILABLE,
    });
    const savedBook = await this.bookRepository.save(book);

    // Create book-author relationships
    const bookAuthors = authorIds.map(authorId => ({
      book_id: savedBook.id,
      author_id: authorId,
    }));

    await this.bookAuthorRepository.save(bookAuthors);

    return this.findById(savedBook.id);
  }

  async findAll(params: BookSearchParams = {}): Promise<{ books: Book[]; total: number }> {
    const { search, category, status, authorId, page = 1, limit = 20 } = params;

    const query = this.bookRepository.createQueryBuilder('book')
      .leftJoinAndSelect('book.bookAuthors', 'bookAuthor')
      .leftJoinAndSelect('bookAuthor.author', 'author');

    if (search) {
      query.andWhere(
        'book.title LIKE :search OR book.description LIKE :search OR book.isbn LIKE :search',
        { search: `%${search}%` }
      );
    }

    if (category) {
      query.andWhere('book.category = :category', { category });
    }

    if (status) {
      query.andWhere('book.status = :status', { status });
    }

    if (authorId) {
      query.andWhere('bookAuthor.author_id = :authorId', { authorId });
    }

    query
      .orderBy('book.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [books, total] = await query.getManyAndCount();

    return { books, total };
  }

  async findById(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: [
        'bookAuthors',
        'bookAuthors.author',
        'reservations',
        'loans'
      ],
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    const { authorIds, ...bookData } = updateBookDto;

    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    // Update book data
    await this.bookRepository.update(id, bookData);

    // Update authors if provided
    if (authorIds) {
      // Verify that all authors exist
      const authors = await this.authorsService.findByIds(authorIds);
      if (authors.length !== authorIds.length) {
        throw new BadRequestException('One or more authors not found');
      }

      // Remove existing book-author relationships
      await this.bookAuthorRepository.delete({ book_id: id });

      // Create new book-author relationships
      const bookAuthors = authorIds.map(authorId => ({
        book_id: id,
        author_id: authorId,
      }));

      await this.bookAuthorRepository.save(bookAuthors);
    }

    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    await this.bookRepository.delete(id);
  }

  async updateStatus(id: number, status: BookStatus): Promise<Book> {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    await this.bookRepository.update(id, { status });
    return this.findById(id);
  }

  async getCategories(): Promise<string[]> {
    const result = await this.bookRepository
      .createQueryBuilder('book')
      .select('DISTINCT book.category', 'category')
      .where('book.category IS NOT NULL')
      .getRawMany();

    return result.map(item => item.category).filter(Boolean);
  }

  async getBookStats() {
    const totalBooks = await this.bookRepository.count();
    const availableBooks = await this.bookRepository.count({ where: { status: BookStatus.AVAILABLE } });
    const borrowedBooks = await this.bookRepository.count({ where: { status: BookStatus.BORROWED } });
    const reservedBooks = await this.bookRepository.count({ where: { status: BookStatus.RESERVED } });

    return {
      totalBooks,
      availableBooks,
      borrowedBooks,
      reservedBooks,
    };
  }
}