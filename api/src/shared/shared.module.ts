import { Module } from '@nestjs/common';
import { JetshifterMongooseModule } from './modules/jetshifter-mongoose-module/jetshifter-mongoose.module';
@Module({
  imports: [JetshifterMongooseModule],
  exports: [JetshifterMongooseModule],
})
export class SharedModule {}
