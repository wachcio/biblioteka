import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LoanStatus } from '../entities/loan.entity';

export class UpdateLoanDto {
  @ApiProperty({
    description: 'Loan status',
    enum: LoanStatus,
    example: LoanStatus.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(LoanStatus)
  status?: LoanStatus;

  @ApiProperty({
    description: 'Due date for returning the book',
    example: '2023-12-15T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiProperty({
    description: 'Date when the book was returned',
    example: '2023-12-10T14:30:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  returned_at?: string;
}