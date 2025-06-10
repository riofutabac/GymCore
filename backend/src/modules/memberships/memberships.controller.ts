import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards,
  Logger,
} from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { RenewMembershipDto } from './dto/renew-membership.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('memberships')
@UseGuards(AuthGuard)
export class MembershipsController {
  private readonly logger = new Logger(MembershipsController.name);

  constructor(private readonly membershipsService: MembershipsService) {}

  @Get('my')
  async getMyMembership(@CurrentUser('sub') userId: string) {
    this.logger.log(`Getting membership for user: ${userId}`);
    return this.membershipsService.getMyMembership(userId);
  }

  @Get('all')
  @Roles([Role.MANAGER, Role.SYS_ADMIN])
  @UseGuards(RoleGuard)
  async getAllMemberships(@CurrentUser('sub') userId: string) {
    this.logger.log(`Getting all memberships for user: ${userId}`);
    return this.membershipsService.getAllMemberships(userId);
  }

  @Post(':id/renew')
  @Roles([Role.CLIENT, Role.RECEPTION, Role.MANAGER])
  @UseGuards(RoleGuard)
  async renewMembership(
    @Param('id') membershipId: string,
    @Body() renewMembershipDto: RenewMembershipDto,
    @CurrentUser('sub') userId: string,
  ) {
    this.logger.log(`Renewing membership ${membershipId} for user: ${userId}`);
    return this.membershipsService.renew(userId, renewMembershipDto);
  }

  @Post(':id/suspend')
  @Roles([Role.MANAGER, Role.SYS_ADMIN])
  @UseGuards(RoleGuard)
  async suspendMembership(@Param('id') membershipId: string) {
    this.logger.log(`Suspending membership: ${membershipId}`);
    return this.membershipsService.suspend(membershipId);
  }
}