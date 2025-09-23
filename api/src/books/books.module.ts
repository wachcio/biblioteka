import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { Book } from './entities/book.entity';
import { BookAuthor } from './entities/book-author.entity';
import { AuthorsModule } from '../authors/authors.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, BookAuthor]),
    AuthorsModule,
  ],
  providers: [BooksService],
  controllers: [BooksController],
  exports: [BooksService],
})
export class BooksModule {}