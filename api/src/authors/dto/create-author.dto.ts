import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthorDto {
  @ApiProperty({
    description: 'Author first name',
    example: 'John',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  first_name: string;

  @ApiProperty({
    description: 'Author last name',
    example: 'Doe',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  last_name: string;

  @ApiProperty({
    description: 'Author biography',
    example: 'A renowned author...',
    required: false
  })
  @IsOptional()
  @IsString()
  bio?: string;
}