import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReservationStatus } from '../entities/reservation.entity';

export class UpdateReservationDto {
  @ApiProperty({
    description: 'Reservation status',
    enum: ReservationStatus,
    example: ReservationStatus.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @ApiProperty({
    description: 'Reservation expiration date',
    example: '2023-12-01T10:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expires_at?: string;
}