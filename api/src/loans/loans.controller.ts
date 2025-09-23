import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { LoansService, LoanSearchParams } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, User } from '../users/entities/user.entity';
import { LoanStatus } from './entities/loan.entity';

@ApiTags('Loans')
@Controller('loans')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new loan (Admin only)' })
  @ApiResponse({ status: 201, description: 'Loan successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request - Book not available or user limit reached' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'User or book not found' })
  create(@Body() createLoanDto: CreateLoanDto, @CurrentUser() admin: User) {
    return this.loansService.create(createLoanDto, admin.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all loans with filtering (Admin only)' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'bookId', required: false, description: 'Filter by book ID' })
  @ApiQuery({ name: 'adminId', required: false, description: 'Filter by admin ID' })
  @ApiQuery({ name: 'status', required: false, enum: LoanStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'overdue', required: false, description: 'Filter overdue loans (true/false)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 20)' })
  @ApiResponse({ status: 200, description: 'Loans retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  findAll(
    @Query('userId') userId?: number,
    @Query('bookId') bookId?: number,
    @Query('adminId') adminId?: number,
    @Query('status') status?: LoanStatus,
    @Query('overdue') overdue?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const params: LoanSearchParams = {
      userId,
      bookId,
      adminId,
      status,
      overdue,
      page,
      limit,
    };
    return this.loansService.findAll(params);
  }

  @Get('my-loans')
  @ApiOperation({ summary: 'Get current user loans' })
  @ApiResponse({ status: 200, description: 'User loans retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMyLoans(@CurrentUser() user: User) {
    return this.loansService.findByUserId(user.id);
  }

  @Get('overdue')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all overdue loans (Admin only)' })
  @ApiResponse({ status: 200, description: 'Overdue loans retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  getOverdueLoans() {
    return this.loansService.getOverdueLoans();
  }

  @Get('my-overdue')
  @ApiOperation({ summary: 'Get current user overdue loans' })
  @ApiResponse({ status: 200, description: 'User overdue loans retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMyOverdueLoans(@CurrentUser() user: User) {
    return this.loansService.getUserOverdueLoans(user.id);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get loan statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  getStats() {
    return this.loansService.getLoanStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get loan by ID' })
  @ApiResponse({ status: 200, description: 'Loan retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Loan not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.loansService.findById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update loan (Admin only)' })
  @ApiResponse({ status: 200, description: 'Loan updated successfully' })
  @ApiResponse({ status: 404, description: 'Loan not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLoanDto: UpdateLoanDto,
  ) {
    return this.loansService.update(id, updateLoanDto);
  }

  @Post(':id/return')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Return a book (Admin only)' })
  @ApiResponse({ status: 200, description: 'Book returned successfully' })
  @ApiResponse({ status: 404, description: 'Loan not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  returnBook(@Param('id', ParseIntPipe) id: number) {
    return this.loansService.returnBook(id);
  }

  @Post(':id/extend')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Extend loan due date (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        newDueDate: {
          type: 'string',
          format: 'date-time',
          example: '2023-12-30T23:59:59Z',
          description: 'New due date for the loan',
        },
      },
      required: ['newDueDate'],
    },
  })
  @ApiResponse({ status: 200, description: 'Loan extended successfully' })
  @ApiResponse({ status: 404, description: 'Loan not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid due date or loan not active' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  extendLoan(
    @Param('id', ParseIntPipe) id: number,
    @Body('newDueDate') newDueDate: string,
  ) {
    return this.loansService.extendLoan(id, newDueDate);
  }

  @Post('check-overdue')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Check and mark overdue loans (Admin only)' })
  @ApiResponse({ status: 200, description: 'Overdue loans processed successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  checkOverdue() {
    return this.loansService.checkOverdueLoans();
  }
}