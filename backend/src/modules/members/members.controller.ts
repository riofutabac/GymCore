import { 
  Controller, 
  Post, 
  Body, 
  UseGuards,
  Logger,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { GymMembershipDto } from './dto/join-gym.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('members')
@UseGuards(AuthGuard)
export class MembersController {
  private readonly logger = new Logger(MembersController.name);

  constructor(private readonly membersService: MembersService) {}

  @Post('join-gym')
  async joinGym(
    @Body() gymMembershipDto: GymMembershipDto,
    @CurrentUser('sub') userId: string,
  ) {
    this.logger.log(`User ${userId} joining gym ${gymMembershipDto.gymId}`);
    return this.membersService.joinGym(userId, gymMembershipDto.gymId);
  }
}
