import { IsArray, IsDate, IsString } from "class-validator";
import { Expose, Exclude } from 'class-transformer';

export class GlobalFlightsInputDto {
    
    @Expose()
    @IsString()
    flightNumber: string;

    @Expose()
    @IsString()
    origin: string;

    @Expose()
    @IsString()
    destination: string;

    @Expose()
    @IsArray()
    @IsString({ each: true })
    time: string[];

    @Expose()
    @IsString()
    duration: string;

    
}
