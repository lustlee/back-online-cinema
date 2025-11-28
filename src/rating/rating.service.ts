import { Injectable } from '@nestjs/common';
import type { ReturnModelType } from '@typegoose/typegoose/lib/types';
import { Types } from 'mongoose';
import { InjectModel } from 'nestjs-typegoose';
import { MovieService } from 'src/movie/movie.service';
import { SetRatingDto } from './dto/set-rating.dto';
import { RatingModel } from './rating.model';

@Injectable()
export class RatingService {
	constructor(
		// @ts-ignore
		@InjectModel(RatingModel)
		private readonly ratingModel: ReturnModelType<typeof RatingModel>,
		private readonly movieService: MovieService
	) {}

	async averageRatingByMovie(movieId: Types.ObjectId | string) {
		try {
			const ratings = await this.ratingModel
				.find({ movie: movieId })
				.select('value')
				.exec();
			
			if (!ratings.length) return 0;
			
			const sum = ratings.reduce((total, rating) => total + rating.value, 0);
			const average = sum / ratings.length;
			
			return Number(average.toFixed(1));
		} catch (error) {
			console.error('Error calculating average rating:', error);
			return 0;
		}
	}

	async setRating(userId: Types.ObjectId, dto: SetRatingDto) {
		const { movieId, value } = dto
		
		const newRating = await this.ratingModel
			.findOneAndUpdate(
				{
					movie: movieId,
					user: userId
				},
				{
					user: userId,
					movie: movieId,
					value,
				},
				{
					upsert: true,
					new: true,
					setDefaultsOnInsert: true
				}
			)
			.exec();
		
		
		const averageRating = await this.averageRatingByMovie(movieId)
		
		await this.movieService.updateRating(movieId, averageRating)
		
		if (!isNaN(averageRating)) {
			await this.movieService.updateRating(movieId, averageRating);
		}
		
		return newRating
	}
	
	async getMovieValueByUser(movieId: Types.ObjectId, userId: Types.ObjectId) {
		const data = await this.ratingModel
			.findOne({
				movie: movieId,
				user: userId
			})
			.select('value')
			.lean<{ value: number }>()
			.exec();
		
		return data?.value ?? 0;
	}
}
