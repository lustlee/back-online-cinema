import { Injectable, NotFoundException } from '@nestjs/common';
import type { ReturnModelType } from '@typegoose/typegoose/lib/types';
import { InjectModel } from 'nestjs-typegoose';
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
}
