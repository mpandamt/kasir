import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleOAuthGuard } from './utils/google-oauth.guard';
import { RegisterUserRequest, UserResponse } from '../model/user.model';
import { WebResponse } from '../model/web.model';
import { LocalAuthGuard } from './utils/local.guard';
import { Roles } from '../common/roles.decorator';
import { Request } from 'express';
import { ApiBody, ApiCookieAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {
    return { message: 'Google authentication' };
  }

  @Get('google/redirect')
  @UseGuards(GoogleOAuthGuard)
  googleAuthRedirect() {
    return { message: 'ok' };
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiBody({
    type: RegisterUserRequest,
  })
  login() {
    return {
      message: 'Login successful',
    };
  }

  @Post('register')
  async register(
    @Body() request: RegisterUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    const data = await this.authService.register(request);
    return {
      data,
    };
  }

  @ApiCookieAuth()
  @Roles()
  @Delete('logout')
  async logout(@Req() req: Request) {
    const sessionID = req.sessionID;
    await this.authService.logout(sessionID);
    return {
      message: 'logged out',
    };
  }
}
