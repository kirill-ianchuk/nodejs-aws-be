import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse, Method } from 'axios';
import { Request } from 'express';

@Injectable()
export class AppService {
  async proxy(serviceBaseUrl: string, req: Request): Promise<AxiosResponse> {
    return axios({
      baseURL: serviceBaseUrl,
      url: req.originalUrl.split('/').slice(2).join('/'),
      method: req.method as Method,
      data: req.body
    })
  }
}

