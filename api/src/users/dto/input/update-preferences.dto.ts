// update-preferences.dto.ts
import { IsBoolean } from 'class-validator';

export class UpdatePreferencesDto {
  @IsBoolean()
  useMelatonin: boolean;

  @IsBoolean()
  useCoffee: boolean;
}
