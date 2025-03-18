import { IsNumber, IsString,IsArray,IsOptional } from 'class-validator';

export class AirportsInputDto {
    @IsString()
    iataCode: string;
    @IsString()
    name: string;
    @IsString()
    countryCode: string;
    @IsString()
    cityCode: string;
    @IsString()
    timeZone: string;
    @IsNumber()
    latitude: number;
    @IsNumber()
    longitude: number;
    @IsArray() // Validate that it's an array
    @IsString({ each: true }) // Validate that each item in the array is a string
    @IsOptional() // Make it optional (defaults to an empty array if not provided)
    routes: string[] = []; // Default to an empty array
}
