import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { User } from '@prisma/client';
import { PartialUser } from '@auth/interfaces/interfaces';
import { compare, hash } from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(userDto: PartialUser) {
    const hashedPassword = userDto.password ? await this.hashData(userDto.password) : null;

    if (userDto.provider) {
      return await this.prisma.user.upsert({
        where: { email: userDto.email },
        update: {
          ...userDto,
          password: hashedPassword,
        },
        create: {
          ...userDto,
          password: hashedPassword,
        },
      });
    }

    return await this.prisma.user.create({
      data: { ...userDto, password: hashedPassword },
    });
  }

  async updateUser(id: string, userDto: Partial<User>, currentPassword: string) {
    const hashedPassword = userDto.password ? await this.hashData(userDto.password) : currentPassword;

    return await this.prisma.user.update({
      where: { id },
      data: { ...userDto, password: hashedPassword },
    });
  }

  async removeUser(id: string) {
    return await this.prisma.user.delete({ where: { id } });
  }

  async getAllUsers() {
    return await this.prisma.user.findMany();
  }

  async getUserById(id: string) {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async validateUser(email: string, pass: string | null) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    const isPassMismatch = user?.password && pass ? await compare(pass, user.password) : false;

    if (!isPassMismatch) {
      return null;
    }

    return user;
  }

  private async hashData(data: string): Promise<string> {
    const saltRounds = 10;
    return await hash(data, saltRounds);
  }
}
