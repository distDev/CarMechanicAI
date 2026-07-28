import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ProblemService } from '../services/problem.service';

import { ProblemListItemDto } from '../dto/problem-list-item.dto';

@ApiTags('Vehicles Problems')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vehicles')
export class VehicleProblemController {
  constructor(private readonly problemService: ProblemService) {}

  @Get(':vehicleId/problems')
  @ApiOperation({ summary: 'Get all problems for a vehicle' })
  @ApiOkResponse({ type: ProblemListItemDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Vehicle not found' })
  findAllByVehicleId(
    @CurrentUser() user: AuthenticatedUser,
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
  ) {
    return this.problemService.findAllByVehicleId(vehicleId, user.id);
  }
}
