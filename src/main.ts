import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { Logger, clc } from './components/logger';
import * as process from 'process';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule, { logger: logger });
  const port = process.env.SERVICE_PORT || 3000;

  const config = new DocumentBuilder()
    .setTitle('Example API')
    .setDescription('Description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document, {
    swaggerOptions: {
      defaultModelsExpandDepth: -1,
      operationsSorter: false,
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  await app.listen(port, () =>
    logger.log(
      clc.cyanBright(`Server started on port: ${port}`),
      'NestApplication',
    ),
  );
}
(async () => bootstrap())();
