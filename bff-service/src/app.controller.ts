import { All, Controller, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';

@Controller('*')
export class AppController {
  constructor(
      private readonly configService: ConfigService,
      private readonly appService: AppService,
  ) {}

  @All()
  async proxy(@Req() req: Request, @Res() res: Response) {
    const serviceName = req.originalUrl.split('/')[1];

    const serviceBaseUrl = this.configService.get(serviceName);

    if (!serviceBaseUrl) {
      return res.status(502).send({ message: 'Cannot process request' });
    }

    try {
      const serviceResponse = await this.appService.proxy(serviceBaseUrl, req);

      return res.status(serviceResponse.status).send(serviceResponse.data);
    } catch (err) {
      if (err.response) {
        return res.status(err.response.status).send(err.response.data);
      }

      return res.status(500).send({ message: err.message });
    }
  }
}
