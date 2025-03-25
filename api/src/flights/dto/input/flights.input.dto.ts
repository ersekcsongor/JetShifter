import { IsDate, IsString } from "class-validator";

export class FlightsInputDto {
    @IsString()
    origin: string;
    @IsString()
    destination: string;
    @IsString()
    date: string;
    @IsString()
    data: string;
    @IsDate()
    createdAt: Date
}
