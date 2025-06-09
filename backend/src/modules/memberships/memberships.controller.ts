import { Controller, Get, Post, Body, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { RenewMembershipDto } from './dto/renew-membership.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/memberships')
@UseGuards(AuthGuard)
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Get('my-membership')
  async getMyMembership(@CurrentUser('id') userId: string) {
    return this.membershipsService.getMyMembership(userId);
  }

  @Post(':id/renew')
  @UseGuards(RoleGuard)
  @Roles(['CLIENT', 'RECEPTION', 'MANAGER'])
  async renewMembership(
    @Param('id') membershipId: string,
    @Body() renewMembershipDto: RenewMembershipDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.membershipsService.renew(userId, renewMembershipDto);
  }

  @Post(':id/suspend')
  @UseGuards(RoleGuard)
  @Roles(['MANAGER', 'SYS_ADMIN'])
  async suspendMembership(@Param('id') membershipId: string) {
    return this.membershipsService.suspend(membershipId);
  }
}