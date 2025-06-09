import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AccessControlService } from './access-control.service';
import { QrGeneratorService } from './qr-generator.service';
import { ValidateQRDto } from './dto/validate-qr.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/access-control')
@UseGuards(AuthGuard)
export class AccessControlController {
  constructor(
    private readonly accessControlService: AccessControlService,
    private readonly qrGeneratorService: QrGeneratorService,
  ) {}

  @Get('my-qr')
  @UseGuards(RoleGuard)
  @Roles(['CLIENT'])
  async getMyQR(@CurrentUser('id') userId: string) {
    const qrCode = await this.qrGeneratorService.generateDynamicQR(userId);
    return { qrCode, expiresIn: 30000 };
  }

  @Post('validate-qr')
  @UseGuards(RoleGuard)
  @Roles(['RECEPTION', 'MANAGER'])
  async validateQR(
    @Body() validateQRDto: ValidateQRDto,
    @CurrentUser('id') validatorId: string,
  ) {
    return this.accessControlService.validateQR(validateQRDto, validatorId);
  }
}