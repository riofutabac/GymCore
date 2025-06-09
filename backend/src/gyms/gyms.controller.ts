import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { GymsService } from './gyms.service';
import { CreateGymDto } from './dto/create-gym.dto';
import { JoinGymDto } from './dto/join-gym.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('api/gyms')
@UseGuards(AuthGuard)
export class GymsController {
  constructor(private readonly gymsService: GymsService) {}

  @Post('join-by-code')
  async joinGymByCode(@CurrentUser('id') userId: string, @Body() joinGymDto: JoinGymDto) {
    return this.gymsService.joinGymByCode(userId, joinGymDto);
  }

  @Get('my-gym')
  async findMyGym(@CurrentUser('id') userId: string) {
    return this.gymsService.findMyGym(userId);
  }

  @Post()
  async create(@Body() createGymDto: CreateGymDto, @CurrentUser('id') ownerId: string) {
    return this.gymsService.create(createGymDto, ownerId);
  }

  @Get()
  async findAll() {
    return this.gymsService.findAll();
  }
}