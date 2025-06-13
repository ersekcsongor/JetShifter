import { Expose } from 'class-transformer';
import { IsNumber, IsString, IsArray, IsOptional } from 'class-validator';

export class GlobalAirportsInputDto {
    @Expose()
    @IsString()
    iataCode: string;

    @Expose()
    @IsString()
    name: string;

    @Expose()
    @IsString()
    countryCode: string;

    @Expose()
    @IsString()
    cityCode: string;

    @Expose()
    @IsString()
    timeZone: string;
 
    @Expose()
    @IsString()
    countryName: string;
}