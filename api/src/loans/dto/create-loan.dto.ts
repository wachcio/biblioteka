import { IsNumber, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateLoanDto {
  @ApiProperty({
    description: 'User ID who will borrow the book',
    example: 1,
  })
  @IsNumber()
  @Type(() => Number)
  user_id: number;

  @ApiProperty({
    description: 'Book ID to be loaned',
    example: 1,
  })
  @IsNumber()
  @Type(() => Number)
  book_id: number;

  @ApiProperty({
    description: 'Due date for returning the book (optional, default is 14 days from now)',
    example: '2023-12-15T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  due_date?: string;
}