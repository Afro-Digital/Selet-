import { Injectable, ConflictException, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { SetupOwnerDto } from './dto/setup-owner.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generates Access Token and Refresh Token.
   */
  generateTokens(user: { id: string; email: string; role: UserRole; organizationId: string }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  /**
   * First-run setup: creates initial organization and OWNER account.
   */
  async setupFirstRunOwner(dto: SetupOwnerDto) {
    // Check if an owner already exists
    const existingOwner = await this.prisma.user.findFirst({
      where: { role: UserRole.OWNER },
    });

    if (existingOwner) {
      throw new ConflictException(
        'First-run setup has already been completed. Owner account exists.',
      );
    }

    const passwordHash = await this.hashPassword(dto.password);

    // Create Organization and Owner User in a transaction
    const org = await this.prisma.organization.create({
      data: {
        name: dto.organizationName,
        defaultCurrency: 'ETB',
        minimumFloorMargin: 0.15,
        targetMargin: 0.3,
        stretchMargin: 0.4,
        users: {
          create: {
            name: dto.name,
            email: dto.email.toLowerCase().trim(),
            passwordHash,
            role: UserRole.OWNER,
            isActive: true,
          },
        },
      },
      include: {
        users: true,
      },
    });

    const ownerUser = org.users[0]!;

    await this.auditService.log({
      organizationId: org.id,
      userId: ownerUser.id,
      action: 'FIRST_RUN_OWNER_SETUP',
      entityType: 'User',
      entityId: ownerUser.id,
      newValue: { email: ownerUser.email, role: ownerUser.role, orgName: org.name },
    });

    const tokens = this.generateTokens(ownerUser);

    return {
      message: 'Owner setup completed successfully',
      organization: {
        id: org.id,
        name: org.name,
        defaultCurrency: org.defaultCurrency,
      },
      user: {
        id: ownerUser.id,
        name: ownerUser.name,
        email: ownerUser.email,
        role: ownerUser.role,
      },
      ...tokens,
    };
  }

  /**
   * User login with email and password.
   */
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await this.comparePassword(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.auditService.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
    });

    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
      ...tokens,
    };
  }

  /**
   * Refreshes access token.
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User is no longer active');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
