// update-sleep-times.dto.ts
import { IsString, Matches } from 'class-validator';

export class UpdateSleepTimesDto {
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'bedtime must be in HH:mm format (e.g., 22:00)',
  })
  bedtime: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'wakeupTime must be in HH:mm format (e.g., 06:00)',
  })
  wakeupTime: string;
}
