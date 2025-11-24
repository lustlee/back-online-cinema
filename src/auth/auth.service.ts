import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { ReturnModelType } from '@typegoose/typegoose/lib/types';
import { compare, hash } from 'bcryptjs';
import { InjectModel } from 'nestjs-typegoose';
import { UserModel } from 'src/user/user.model';
import { AuthDto } from './dto/auth.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';

@Injectable()
export class AuthService {
	constructor(
		// TODO: Нужно будет решить момент с ignore, видимо разные версии nestjs конфликтуют между собой.
		// @ts-ignore
		@InjectModel(UserModel)
		private readonly userModel: ReturnModelType<typeof UserModel>,
		private readonly jwtService: JwtService
	) {}

	async login(dto: AuthDto) {
		const user = await this.validateUser(dto);

		const tokens = await this.issueTokenPair(String(user._id));

		return {
			user: this.returnUserFields(user),
			...tokens,
		};
	}

	async getNewTokens({ refreshToken }: RefreshTokenDto) {
		if (!refreshToken) throw new UnauthorizedException('Please sign in!');

		const result = await this.jwtService.verifyAsync(refreshToken);

		if (!result) throw new UnauthorizedException('Invalid token!');

		const user = await this.userModel.findById(result._id);

		if (!user) throw new UnauthorizedException('User not found');

		const tokens = await this.issueTokenPair(String(user._id));

		return {
			user: this.returnUserFields(user),
			...tokens,
		};
	}

	async register(dto: AuthDto) {
		const oldUser = await this.userModel.findOne({ email: dto.email });
		if (oldUser) {
			throw new BadRequestException('User already exists');
		}

		const hashedPassword = await hash(dto.password, 10);

		const newUser = new this.userModel({
			email: dto.email,
			password: hashedPassword,
		});

		const tokens = await this.issueTokenPair(String(newUser._id));

		return {
			user: this.returnUserFields(newUser),
			...tokens,
		};
	}

	async validateUser(dto: AuthDto): Promise<UserModel> {
		const user = await this.userModel.findOne({ email: dto.email });

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

	async issueTokenPair(userId: string) {
		const data = { _id: userId };

		const refreshToken = await this.jwtService.signAsync(data, {
			expiresIn: '15d',
		});

		const accessToken = await this.jwtService.signAsync(data, {
			expiresIn: '1h',
		});

		return { refreshToken, accessToken };
	}

	returnUserFields(user: UserModel) {
		return {
			_id: user._id,
			email: user.email,
			isAdmin: user.isAdmin,
		};
	}
}
