import { Prop ,Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema()
export class CountryModel extends Document {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  name: string;
  
  @Prop({ required: true })
  isEu: boolean;

  @Prop({ required: true })
  isSchengen: boolean;

  @Prop({default: ''})
  phonePrefix: string;
}

export const CountrySchema = SchemaFactory.createForClass(CountryModel);