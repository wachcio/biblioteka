import { IsString, IsNumber, IsArray, IsOptional, MinLength, MaxLength, IsUrl, IsISBN } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBookDto {
  @ApiProperty({
    description: 'Book title',
    example: 'The Great Gatsby',
    minLength: 1,
    maxLength: 255
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Publication year',
    example: 1925,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  year?: number;

  @ApiProperty({
    description: 'ISBN number',
    example: '978-0-7432-7356-5',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  isbn?: string;

  @ApiProperty({
    description: 'Book category',
    example: 'Fiction',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiProperty({
    description: 'Book description',
    example: 'A classic American novel...',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Cover image URL',
    example: 'https://example.com/cover.jpg',
    required: false
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  cover_url?: string;

  @ApiProperty({
    description: 'Array of author IDs',
    example: [1, 2],
    type: [Number]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  authorIds: number[];
}