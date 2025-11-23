import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import type { ReturnModelType } from '@typegoose/typegoose/lib/types';
import { compare, hash } from 'bcryptjs';
import { InjectModel } from 'nestjs-typegoose';
import { UserModel } from 'src/user/user.model';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
	constructor(
		// TODO: Нужно будет решить момент с ignore, видимо разные версии nestjs конфликтуют между собой.
		// @ts-ignore
		@InjectModel(UserModel)
		private readonly UserModel: ReturnModelType<typeof UserModel>
	) {}

	async login(dto: AuthDto) {
		return this.validateUser(dto);
	}

	async register(dto: AuthDto) {
		const oldUser = await this.UserModel.findOne({ email: dto.email });
		if (oldUser) {
			throw new BadRequestException('User already exists');
		}

		const hashedPassword = await hash(dto.password, 10);

		const newUser = new this.UserModel({
			email: dto.email,
			password: hashedPassword,
		});

		return newUser.save();
	}

	async validateUser(dto: AuthDto): Promise<UserModel> {
		const user = await this.UserModel.findOne({ email: dto.email });

		if (!user) {
			throw new UnauthorizedException('User not found');
		}
		const isValidPassword = await compare(
			dto.password,
			user.password as string
		);

		if (!isValidPassword) {
			throw new UnauthorizedException('Invalid password');
		}

		return user;
	}
}
