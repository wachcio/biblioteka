import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'securePassword123'
  })
  @IsString()
  password: string;
}