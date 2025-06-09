import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AccessControlService } from './access-control.service';
import { ValidateQRDto } from './dto/validate-qr.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('access-control')
@UseGuards(AuthGuard)
export class AccessControlController {
  constructor(
    private readonly accessControlService: AccessControlService,
  ) {}

  @Get('my-qr')
  @Roles(['CLIENT'])
  @UseGuards(RoleGuard)
  async getMyQR(@CurrentUser('id') userId: string) {
    return this.accessControlService.getMyQR(userId);
  }

  @Post('validate-qr')
  @Roles(['RECEPTION', 'MANAGER'])
  @UseGuards(RoleGuard)
  async validateQR(
    @Body() validateQRDto: ValidateQRDto,
    @CurrentUser('id') validatorId: string,
  ) {
    return this.accessControlService.validateQR(validateQRDto, validatorId);
  }
}