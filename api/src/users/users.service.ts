import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await argon2.hash(createUserDto.password);

    const user = this.userRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password_hash: hashedPassword,
      role: createUserDto.role || UserRole.USER,
    });

    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password_hash', 'role', 'created_at']
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.update(id, updateUserDto);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.delete(id);
  }

  async getUserStats(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['loans', 'reservations'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const activeLoans = user.loans.filter(loan => loan.status === 'active').length;
    const totalLoans = user.loans.length;
    const activeReservations = user.reservations.filter(res => res.status === 'active').length;
    const totalReservations = user.reservations.length;

    return {
      activeLoans,
      totalLoans,
      activeReservations,
      totalReservations,
    };
  }
}