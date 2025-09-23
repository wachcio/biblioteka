import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReservationsService, ReservationSearchParams } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, User } from '../users/entities/user.entity';
import { ReservationStatus } from './entities/reservation.entity';

@ApiTags('Reservations')
@Controller('reservations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reservation' })
  @ApiResponse({ status: 201, description: 'Reservation successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request - Book not available or user limit reached' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  create(@Body() createReservationDto: CreateReservationDto, @CurrentUser() user: User) {
    return this.reservationsService.create(createReservationDto, user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all reservations with filtering (Admin only)' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'bookId', required: false, description: 'Filter by book ID' })
  @ApiQuery({ name: 'status', required: false, enum: ReservationStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 20)' })
  @ApiResponse({ status: 200, description: 'Reservations retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  findAll(
    @Query('userId') userId?: number,
    @Query('bookId') bookId?: number,
    @Query('status') status?: ReservationStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const params: ReservationSearchParams = {
      userId,
      bookId,
      status,
      page,
      limit,
    };
    return this.reservationsService.findAll(params);
  }

  @Get('my-reservations')
  @ApiOperation({ summary: 'Get current user reservations' })
  @ApiResponse({ status: 200, description: 'User reservations retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMyReservations(@CurrentUser() user: User) {
    return this.reservationsService.findByUserId(user.id);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get reservation statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  getStats() {
    return this.reservationsService.getReservationStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reservation by ID' })
  @ApiResponse({ status: 200, description: 'Reservation retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    // Users can only view their own reservations unless they're admin
    return this.reservationsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update reservation' })
  @ApiResponse({ status: 200, description: 'Reservation updated successfully' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only modify own reservations' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReservationDto: UpdateReservationDto,
    @CurrentUser() user: User,
  ) {
    return this.reservationsService.update(id, updateReservationDto, user);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel own reservation' })
  @ApiResponse({ status: 200, description: 'Reservation cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Reservation not found or does not belong to user' })
  @ApiResponse({ status: 400, description: 'Bad request - Only active reservations can be cancelled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  cancel(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.reservationsService.cancel(id, user.id);
  }

  @Post(':id/convert-to-loan')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Convert reservation to loan (Admin only)' })
  @ApiResponse({ status: 200, description: 'Reservation converted to loan successfully' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Only active reservations can be converted' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  convertToLoan(@Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.convertToLoan(id);
  }

  @Post('check-expired')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Check and expire old reservations (Admin only)' })
  @ApiResponse({ status: 200, description: 'Expired reservations processed successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  checkExpired() {
    return this.reservationsService.checkExpiredReservations();
  }
}