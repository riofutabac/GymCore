import { Controller, Post, Body, Get, UseGuards, Param, Put, Delete } from '@nestjs/common';
import { GymsService } from './gyms.service';
import { CreateGymDto } from './dto/create-gym.dto';
import { JoinGymDto } from './dto/join-gym.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('gyms')
export class GymsController {
  constructor(private readonly gymsService: GymsService) {}

  @Post('join')
  async joinByCode(@Body() joinGymDto: JoinGymDto) {
    return this.gymsService.joinByCode(joinGymDto.joinCode);
  }

  @Get('managers/available')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(['OWNER'])
  async getAvailableManagers() {
    return this.gymsService.getAvailableManagers();
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
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(['OWNER'])
  async create(@Body() gymData: CreateGymDto, @CurrentUser() user: any) {
    return this.gymsService.create(gymData, user.id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() gymData: Partial<CreateGymDto>) {
    return this.gymsService.update(id, gymData);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(@Param('id') id: string) {
    return this.gymsService.delete(id);
  }
}