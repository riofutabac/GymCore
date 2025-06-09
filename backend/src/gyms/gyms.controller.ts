import { Controller, Post, Body, Get, UseGuards, Param } from '@nestjs/common';
import { GymsService } from './gyms.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('gyms')
export class GymsController {
  constructor(private readonly gymsService: GymsService) {}

  @Post('join')
  async joinByCode(@Body() body: { code: string }) {
    return this.gymsService.joinByCode(body.code);
  }

  @Get()
  async getAll() {
    return this.gymsService.getAll();
  }

  @Get('my')
  @UseGuards(AuthGuard)
  async getMyGym(@CurrentUser() user: any) {
    return this.gymsService.getMyGym(user.id);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.gymsService.getById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() gymData: any, @CurrentUser() user: any) {
    return this.gymsService.create(gymData, user.id);
  }
}