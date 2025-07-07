import { forwardRef, Module } from '@nestjs/common';
import { Gateway } from './gateway';

@Module({
  providers: [Gateway],
})
export class GatewayModule {}
