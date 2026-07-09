import { StorageDriver } from '@/modules/file-upload/enums/storage-driver.enum';
import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  APP_NAME: Joi.string().default('carai-backend'),
  PORT: Joi.number().port().default(3000),
  API_PREFIX: Joi.string().default('api/v1'),
  SWAGGER_PATH: Joi.string().default('docs'),
  LOG_LEVEL: Joi.string()
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace')
    .default('info'),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .required(),

  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().port().required(),
  REDIS_TTL_SECONDS: Joi.number().integer().min(1).default(60),

  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),

  JWT_ACCESS_EXPIRES_IN: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().required(),

  GOOGLE_CLIENT_ID: Joi.string().required(),

  FILE_STORAGE_DRIVER: Joi.string()
    .valid(...Object.values(StorageDriver))
    .default(StorageDriver.LOCAL),

  UPLOAD_DIR: Joi.string().when('FILE_STORAGE_DRIVER', {
    is: StorageDriver.LOCAL,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  FILE_PUBLIC_URL: Joi.string().uri().required(),

  MINIO_ENDPOINT: Joi.string().when('FILE_STORAGE_DRIVER', {
    is: StorageDriver.MINIO,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  MINIO_PORT: Joi.number().port().when('FILE_STORAGE_DRIVER', {
    is: StorageDriver.MINIO,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  MINIO_USE_SSL: Joi.boolean().default(false),

  MINIO_ACCESS_KEY: Joi.string().when('FILE_STORAGE_DRIVER', {
    is: StorageDriver.MINIO,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  MINIO_SECRET_KEY: Joi.string().when('FILE_STORAGE_DRIVER', {
    is: StorageDriver.MINIO,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  MINIO_BUCKET: Joi.string().when('FILE_STORAGE_DRIVER', {
    is: StorageDriver.MINIO,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});
