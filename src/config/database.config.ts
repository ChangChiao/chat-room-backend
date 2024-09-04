import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default (configService: ConfigService): TypeOrmModuleOptions => {
  const options: TypeOrmModuleOptions = {
    type: 'postgres',
    host: configService.get<string>('POSTGRES_HOST'),
    port: +configService.get<number>('POSTGRES_PORT'),
    username: configService.get<string>('POSTGRES_USER'),
    password: configService.get<string>('POSTGRES_PASSWORD'),
    database: configService.get<string>('POSTGRES_DB'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: configService.get<string>('NODE_ENV') !== 'production',
  };
  return options;
};
