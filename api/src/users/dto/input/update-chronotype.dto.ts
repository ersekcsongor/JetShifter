// update-chronotype.dto.ts
import { IsString, IsIn } from 'class-validator';

export class UpdateChronotypeDto {
  @IsString()
  @IsIn(['morning', 'evening', 'intermediate'], {
    message: 'chronotype must be one of: morning, evening, intermediate',
  })
  chronotype: string;
}
