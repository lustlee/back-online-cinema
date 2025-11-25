import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import type { ReturnModelType } from '@typegoose/typegoose/lib/types';
import { genSalt } from 'bcryptjs';
import { hash } from 'crypto';
import { Types } from 'mongoose';
import { InjectModel } from 'nestjs-typegoose';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserModel } from './user.model';

@Injectable()
export class UserService {
	constructor(
		// @ts-ignore
		@InjectModel(UserModel)
		private readonly userModel: ReturnModelType<typeof UserModel>
	) {}

	async byId(_id: string) {
		const user = await this.userModel.findById(_id);

		if (!user) throw new NotFoundException('User not found');

		return user;
	}

	async updateProfile(_id: string, dto: UpdateUserDto) {
		const user = await this.byId(_id);
		const isSameUser = await this.userModel.findOne({ email: dto.email });

		if (isSameUser && String(_id) !== String(isSameUser._id)) {
			throw new NotFoundException('User already exists');
		}

		if (dto.password) {
			const salt = await genSalt(10);
			user.password = hash(dto.password, salt);
		}

		user.email = dto.email;

		if (dto.isAdmin || dto.isAdmin === false) {
			user.isAdmin = dto.isAdmin;
		}

		await user.save();

		return;
	}

	async getCount() {
		return this.userModel.countDocuments().exec();
	}

	async getAll(searchTerm?: string) {
		let options = {};

		if (searchTerm) {
			options = {
				$or: [{ email: new RegExp(searchTerm, 'i') }],
			};
		}

		return this.userModel
			.find(options)
			.select('-password -updatedAt -__v')
			.sort({
				createdAt: 'desc',
			})
			.exec();
	}

	// TODO: Добавил валидацию и улучшил логику
	async delete(id: string) {
		try {
			if (!Types.ObjectId.isValid(id)) {
				throw new BadRequestException('Invalid id');
			}

			const user = await this.userModel.findById(id);

			if (!user) {
				return {
					success: false,
					message: 'User not found',
				};
			}

			await this.userModel.findByIdAndDelete(id);

			return {
				success: true,
				message: 'User deleted successfully',
			};
		} catch (error) {
			throw new InternalServerErrorException('Something went wrong');
		}
	}
}
