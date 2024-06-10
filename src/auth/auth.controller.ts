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
import { UserResponse } from '../model/user.model';
import { WebResponse } from '../model/web.model';
import { LocalAuthGuard } from './utils/local.guard';
import { Roles } from '../common/roles.decorator';
import { Request } from 'express';
import { ApiBody, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

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
    type: LoginDto,
  })
  login() {
    return {
      message: 'Login successful',
    };
  }

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<WebResponse<UserResponse>> {
    const data = await this.authService.register(registerDto);
    return {
      data,
    };
  }

  @ApiCookieAuth()
  @Roles()
  @Delete('logout')
  async logout(@Req() req: Request) {
    req.logout((error) => {
      if (error) {
        throw error;
      }
    });
    return {
      message: 'logged out',
    };
  }
}
