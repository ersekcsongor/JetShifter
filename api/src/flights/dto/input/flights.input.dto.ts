import { IsDate, IsString } from "class-validator";
import { Expose, Exclude } from 'class-transformer';

export class FlightsInputDto {
    @Expose()
    @IsString()
    origin: string;
    @Expose()
    @IsString()
    destination: string;
    @Expose()
    @IsString()
    date: string;
    @Expose()
    @IsString()
    data: string;
    @Expose()
    @IsDate()
    createdAt: Date
}
