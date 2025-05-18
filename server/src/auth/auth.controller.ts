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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { AuthenticatedGuard } from './guards/authenticated.guard';

@Controller('auth')
export class AuthController {
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

      // Set session data
      req.session.userId = userId;
      req.session.isAuthenticated = true;
      req.session.activeTenants = {};

      return { success: true };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @Post('logout')
  @UseGuards(AuthenticatedGuard)
  async logout(@Req() req: Request, @Res() res: Response) {
    // Clear the session cookie
    res.clearCookie('connect.sid', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      domain: req.hostname.includes('lvh.me') ? '.myapp.lvh.me' : undefined,
    });

    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ success: false });
      }
      res.status(200).json({ success: true });
    });
  }

  @Get('me')
  @UseGuards(AuthenticatedGuard)
  async getProfile(@Req() req: Request) {
    const userId = req.session.userId;

    // The AuthenticatedGuard ensures userId exists, but we add an extra check
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const tenants = await this.authService.getUserTenants(userId);

    return {
      userId,
      tenants,
    };
  }
}
