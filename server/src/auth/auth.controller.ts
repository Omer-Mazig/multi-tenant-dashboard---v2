import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Get,
  HttpCode,
  UseGuards,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { AuthenticatedGuard } from './guards/authenticated.guard';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() loginData: { username: string; password: string },
    @Req() req: Request,
  ) {
    try {
      const { userId } = await this.authService.login(
        loginData.username,
        loginData.password,
      );

      req.session.userId = userId;
      req.session.isAuthenticated = true;
      req.session.activeTenants = {};

      return { success: true };
    } catch (error) {
      this.logger.error('Invalid credentials');
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @Post('logout')
  @UseGuards(AuthenticatedGuard)
  async logout(@Req() req: Request, @Res() res: Response) {
    res.clearCookie('connect.sid', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      domain: req.hostname.includes('lvh.me') ? '.myapp.lvh.me' : undefined,
    });

    req.session.destroy((err) => {
      if (err) {
        this.logger.error('Error destroying session:', err);
        return res.status(500).json({ success: false });
      }
      res.status(200).json({ success: true });
    });
  }

  @Get('me')
  @UseGuards(AuthenticatedGuard)
  async getProfile(@Req() req: Request) {
    const userId = req.session.userId;

    // The 'AuthenticatedGuard' ensures userId exists, but we add an extra check for safety...
    if (!userId) {
      this.logger.error('User not authenticated');
      throw new UnauthorizedException('User not authenticated');
    }

    const tenants = await this.authService.getUserTenants(userId);

    return {
      userId,
      tenants,
    };
  }
}
