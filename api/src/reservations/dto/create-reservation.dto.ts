import { IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateReservationDto {
  @ApiProperty({
    description: 'Book ID to reserve',
    example: 1,
  })
  @IsNumber()
  @Type(() => Number)
  book_id: number;

  @ApiProperty({
    description: 'Reservation expiration date (optional, default is 7 days from now)',
    example: '2023-12-01T10:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expires_at?: string;
}