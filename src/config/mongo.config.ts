import { ConfigService } from '@nestjs/config';
import { TypegooseModuleOptions } from 'nestjs-typegoose';

export const getMongoDbConfig = async (
  configService: ConfigService
): Promise<TypegooseModuleOptions> => ({
  uri:
    configService.get('MONGO_URI') || 'mongodb://127.0.0.1:27017/online-cinema',
});
