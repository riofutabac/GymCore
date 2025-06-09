import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('memberships')
@UseGuards(AuthGuard)
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Get()
  async findAll() {
    return this.membershipsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.membershipsService.findOne(id);
  }

  @Post()
  async create(@Body() membershipData: any) {
    return this.membershipsService.create(membershipData);
  }
}
