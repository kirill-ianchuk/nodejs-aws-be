import { All, CACHE_MANAGER, Controller, Inject, Req, Res, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { Cache } from 'cache-manager';

const CACHE_TTL_IN_SECONDS = 120;

@Controller('*')
export class AppController {
  constructor(
      @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
      private readonly configService: ConfigService,
      private readonly appService: AppService,
  ) {}

  private readonly logger = new Logger(AppController.name);

  @All()
  async proxy(@Req() req: Request, @Res() res: Response) {
    try {
      const serviceName = req.originalUrl.split('/')[1];

      const serviceBaseUrl = this.configService.get(serviceName);

      if (!serviceBaseUrl) {
        return res.status(502).send({ message: 'Cannot process request' });
      }

      const isCacheableRequest = AppController.isCacheableRequest(req);
      if (isCacheableRequest) {
        const cachedResponse = await this.cacheManager.get(req.originalUrl);

        if (cachedResponse) {
          return res
              .status(200)
              .set('X-Cache', 'HIT')
              .send(cachedResponse);
        }
      }

      const serviceResponse = await this.appService.proxy(serviceBaseUrl, req);

      res.status(serviceResponse.status).send(serviceResponse.data);

      if (isCacheableRequest) {
        await this.cacheManager.set(
            req.originalUrl,
            serviceResponse.data,
            { ttl: CACHE_TTL_IN_SECONDS })
            .catch((err) => this.logger.error(err.message));
      }
    } catch (err) {
      if (err.response) {
        return res.status(err.response.status).send(err.response.data);
      }

      return res.status(500).send({ message: err.message });
    }
  }

  static isCacheableRequest(req: Request): boolean {
    return req.method.toUpperCase() === 'GET' && /^\/product-service\/products\/?$/.test(req.originalUrl.split('?')[0]);
  }
}
