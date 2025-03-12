import { IsBoolean, IsString } from 'class-validator';

export class CountryInputDto {
    @IsString()
    code: string;
    @IsString()
    name: string;
    @IsBoolean()
    isEu: boolean;
    @IsBoolean() 
    isSchengen: boolean;
    @IsString()
    phonePrefix: string;
}
