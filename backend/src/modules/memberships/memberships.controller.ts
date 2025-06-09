import { Controller, Get, Post, Req, Body, UseGuards, NotFoundException } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { AuthGuard } from '../../common/guards/auth.guard'; // Assuming you have an AuthGuard
import { Request } from 'express';
import { RenewMembershipDto } from './dto/renew-membership.dto'; // Assuming this DTO exists

@UseGuards(AuthGuard) // Protect these endpoints with your AuthGuard
@Controller('memberships')
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Get('/my-membership')
  async getMyMembership(@Req() req: Request) {
    // Assuming user information is attached to the request by the AuthGuard
    const userId = req.user.id; // Adjust based on how your user is represented in the request

    const membership = await this.membershipsService.findMembershipByUserId(userId);

    if (!membership) {
      throw new NotFoundException('Membership not found for this user.');
    }

    return membership;
  }

  @Post('/renew')
  async renewMembership(@Req() req: Request, @Body() renewMembershipDto: RenewMembershipDto) {
    const userId = req.user.id; // Adjust based on how your user is represented in the request

    // You would likely pass relevant data from renewMembershipDto to the service
    const updatedMembership = await this.membershipsService.renewMembership(userId, renewMembershipDto);

    return updatedMembership;
  }

  @Post('/suspend')
  async suspendMembership(@Req() req: Request) {
    const userId = req.user.id; // Adjust based on how your user is represented in the request

    const updatedMembership = await this.membershipsService.suspendMembership(userId);

    return updatedMembership;
  }
}