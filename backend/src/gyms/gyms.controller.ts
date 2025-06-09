import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { GymsService } from './gyms.service';
import { JoinGymDto } from './dto/join-gym.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '@prisma/client';

@Controller('gyms')
export class GymsController {
  constructor(private readonly gymsService: GymsService) {}

  @UseGuards(AuthGuard)
  @Post('join-by-code')
  joinByCode(@Body() joinGymDto: JoinGymDto, @GetUser() user: User) {
    return this.gymsService.joinGymByCode(user.id, joinGymDto.joinCode);
  }

  @UseGuards(AuthGuard)
  @Get('my-gym')
  getMyGym(@GetUser() user: User) {
    return this.gymsService.findGymByUser(user.id);
  }
}