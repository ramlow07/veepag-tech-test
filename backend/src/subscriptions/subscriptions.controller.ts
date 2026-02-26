import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionStatus } from './enums/subscription-status.enum';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  create(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(dto);
  }

  // Declared before /:id to avoid "customer" being matched as an id segment
  @Get('customer/:cpf')
  findByCpf(@Param('cpf') cpf: string) {
    return this.subscriptionsService.findByCpf(cpf);
  }

  @Get()
  findAll(
    @Query('status') status?: SubscriptionStatus,
    @Query('productId') productId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.subscriptionsService.findAll({
      status,
      productId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Body() dto: CancelSubscriptionDto) {
    return this.subscriptionsService.cancel(id, dto);
  }
}
