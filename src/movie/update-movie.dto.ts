import { IsArray, IsNumber, IsObject, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class Parameter {
	@IsNumber()
	year: number;

	@IsNumber()
	duration: number;

	@IsString()
	country: string;
}

export class UpdateMovieDto {
	@IsString()
	poster: string;

	@IsString()
	bigPoster: string;

	@IsString()
	title: string;

	@IsString()
	slug: string;

	@IsObject()
	parameters?: Parameter;

	@IsString()
	videoUrl: string;

	@IsArray()
	@IsString({ each: true })
	genres: Types.ObjectId[];

	@IsArray()
	@IsString({ each: true })
	actors: Types.ObjectId[];

	isSendTelegram?: boolean;
}
