import { Expose } from 'class-transformer';
import { IsNumber, IsString,IsArray,IsOptional } from 'class-validator';

export class AirportsInputDto {
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
    @IsNumber()
    latitude: number;
    @Expose()
    @IsNumber()
    longitude: number;
    @Expose()
    @IsArray() // Validate that it's an array
    @IsString({ each: true }) // Validate that each item in the array is a string
    @IsOptional() // Make it optional (defaults to an empty array if not provided)
    routes: string[] = []; // Default to an empty array
}
