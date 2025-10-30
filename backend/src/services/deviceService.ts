import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const deviceService = {
  async findAll() {
    return prisma.device.findMany({ orderBy: { createdAt: 'desc' } });
  },

  async findById(id: string) {
    return prisma.device.findUnique({ where: { id } });
  },

  async create(data: {
    deviceId: string;
    lab: string;
    ipAddress: string;
    port: number;
  }) {
    return prisma.device.create({ data });
  },

  async update(id: string, data: Partial<{ deviceId: string; lab: string; ipAddress: string; port: number }>) {
    return prisma.device.update({ where: { id }, data });
  },

  async deleteById(id: string) {
    return prisma.device.delete({ where: { id } });
  },
};