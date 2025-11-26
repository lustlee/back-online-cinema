import { Injectable, NotFoundException } from '@nestjs/common';
import type { ReturnModelType } from '@typegoose/typegoose/lib/types';
import { InjectModel } from 'nestjs-typegoose';
import { CreateGenreDto } from './dto/create-genre.dto';
import { GenreModel } from './genre.model';

@Injectable()
export class GenreService {
	constructor(
		// @ts-ignore
		@InjectModel(GenreModel)
		private readonly genreModel: ReturnModelType<typeof GenreModel>
	) {}

	async getAll(searchTerm?: string) {
		let options = {};

		if (searchTerm) {
			options = {
				$or: [
					{ name: new RegExp(searchTerm, 'i') },
					{ slug: new RegExp(searchTerm, 'i') },
					{ description: new RegExp(searchTerm, 'i') },
				],
			};
		}

		return this.genreModel
			.find(options)
			.select('-updatedAt -__v')
			.sort({
				createdAt: 'desc',
			})
			.exec();
	}

	async bySlug(slug: string) {
		return this.genreModel.findOne({ slug }).exec();
	}

	async getCollections() {
		const genres = await this.getAll();
		const collections = genres;

		// TODO: Need to write logic
		return collections;
	}

	/* ADMIN PLACE */

	async create() {
		const defaultValue: CreateGenreDto = {
			name: '',
			slug: '',
			description: '',
			icon: '',
		};

		const genre = await this.genreModel.create(defaultValue);

		return genre._id;
	}

	async byId(_id: string) {
		const genre = await this.genreModel.findById(_id);

		if (!genre) throw new NotFoundException('Genre not found');

		return genre;
	}

	async update(_id: string, dto: CreateGenreDto) {
		const updateDoc = await this.genreModel
			.findByIdAndUpdate(_id, dto, { new: true })
			.exec();

		if (!updateDoc) throw new NotFoundException('Genre not found');

		return updateDoc;
	}

	async delete(id: string) {
		const deleteDoc = await this.genreModel.findByIdAndDelete(id).exec();

		if (!deleteDoc) throw new NotFoundException('Genre not found');

		return deleteDoc;
	}
}
