import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`,
    );

    // 檢查並記錄 cookie
    if (req.headers.cookie) {
      console.log('Cookies:');
      const cookies = req.headers.cookie
        .split(';')
        .map((cookie) => cookie.trim());
      cookies.forEach((cookie) => {
        const [name, value] = cookie.split('=');
        console.log(`  ${name}: ${value}`);
      });
    } else {
      console.log('No cookies found in the request');
    }

    next();
  }
}
