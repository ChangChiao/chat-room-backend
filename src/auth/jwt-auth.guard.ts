import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // 重写 canActivate 方法以支持从 cookie 中提取 token
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // 如果请求头中没有 Authorization，但 cookie 中有 token，则添加到请求头
    if (!request.headers.authorization && request.cookies?.auth_token) {
      request.headers.authorization = `Bearer ${request.cookies.auth_token}`;
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}
