import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number.parseInt(process.env.PORT ?? '3000', 10),
  name: process.env.APP_NAME ?? 'carai-backend',
  apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  swaggerPath: process.env.SWAGGER_PATH ?? 'docs',
  logLevel: process.env.LOG_LEVEL ?? 'info',
}));
