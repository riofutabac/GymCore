import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { RenewMembershipDto } from './dto/renew-membership.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('memberships')
@UseGuards(AuthGuard)
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Get('my')
  async getMyMembership(@CurrentUser('id') userId: string) {
    return this.membershipsService.getMyMembership(userId);
  }

  @Get('all')
  @UseGuards(RoleGuard)
  @Roles(['MANAGER', 'SYS_ADMIN'])
  async getAllMemberships(@CurrentUser() user: any) {
    console.log('🎫 [MEMBERSHIPS] Getting all memberships for user:', user);
    
    let gymId = user.staffOfGymId || user.memberOfGymId;
    
    if (user.role === 'SYS_ADMIN' && !gymId) {
      // Para administradores del sistema, obtener su gimnasio
      const userWithGym = await this.membershipsService['prisma'].user.findUnique({
        where: { id: user.id },
        include: { ownedGym: true }
      });
      gymId = userWithGym?.ownedGym?.id;
    }
    
    return this.membershipsService.getAllMemberships(gymId);
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