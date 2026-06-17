import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function listarAuditoria(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = 30;
  const entidad = searchParams.get('entidad');

  const where = entidad ? { entidad } : {};

  const [data, total] = await Promise.all([
    prisma.auditoria.findMany({
      where,
      include: { usuario: { select: { nombre: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditoria.count({ where }),
  ]);

  return NextResponse.json({
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
