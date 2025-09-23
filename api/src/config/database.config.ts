import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Author } from '../authors/entities/author.entity';
import { Book } from '../books/entities/book.entity';
import { BookAuthor } from '../books/entities/book-author.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { Loan } from '../loans/entities/loan.entity';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService): DataSourceOptions => ({
    type: 'mysql',
    host: configService.get('MYSQL_HOST', 'localhost'),
    port: configService.get('MYSQL_PORT', 3306),
    username: configService.get('MYSQL_USER', 'library'),
    password: configService.get('MYSQL_PASSWORD', 'change_me'),
    database: configService.get('MYSQL_DATABASE', 'library'),
    entities: [User, Author, Book, BookAuthor, Reservation, Loan],
    migrations: ['dist/migrations/*.js'],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    charset: 'utf8mb4',
    timezone: '+00:00',
  }),
};

export const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
  username: process.env.MYSQL_USER || 'library',
  password: process.env.MYSQL_PASSWORD || 'change_me',
  database: process.env.MYSQL_DATABASE || 'library',
  entities: [User, Author, Book, BookAuthor, Reservation, Loan],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  charset: 'utf8mb4',
  timezone: '+00:00',
});

export default dataSource;