import { IsNumber, IsString } from 'class-validator';

export class CountryInputDto {
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
}
