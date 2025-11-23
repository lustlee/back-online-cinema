import { Injectable } from '@nestjs/common';
import type { ReturnModelType } from '@typegoose/typegoose/lib/types';
import { InjectModel } from 'nestjs-typegoose';
import { UserModel } from 'src/user/user.model';

@Injectable()
export class AuthService {
  constructor(
    // TODO: Нужно будет решить момент с ignore, видимо разные версии nestjs конфликтуют между собой.
    // @ts-ignore
    @InjectModel(UserModel)
    private readonly UserModel: ReturnModelType<typeof UserModel>
  ) {}

  async register(dto: any) {
    const newUser = new this.UserModel(dto);

    return newUser.save();
  }
}
