import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Author } from './entities/author.entity';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
  ) {}

  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    const author = this.authorRepository.create(createAuthorDto);
    return this.authorRepository.save(author);
  }

  async findAll(search?: string): Promise<Author[]> {
    const query = this.authorRepository.createQueryBuilder('author');

    if (search) {
      query.where(
        'author.first_name LIKE :search OR author.last_name LIKE :search',
        { search: `%${search}%` }
      );
    }

    return query
      .orderBy('author.last_name', 'ASC')
      .addOrderBy('author.first_name', 'ASC')
      .getMany();
  }

  async findById(id: number): Promise<Author> {
    const author = await this.authorRepository.findOne({
      where: { id },
      relations: ['bookAuthors', 'bookAuthors.book'],
    });

    if (!author) {
      throw new NotFoundException('Author not found');
    }

    return author;
  }

  async update(id: number, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    const author = await this.authorRepository.findOne({ where: { id } });
    if (!author) {
      throw new NotFoundException('Author not found');
    }

    await this.authorRepository.update(id, updateAuthorDto);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    const author = await this.authorRepository.findOne({ where: { id } });
    if (!author) {
      throw new NotFoundException('Author not found');
    }

    await this.authorRepository.delete(id);
  }

  async findByIds(ids: number[]): Promise<Author[]> {
    return this.authorRepository.findByIds(ids);
  }
}