import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing roast ID' },
        { status: 400 }
      );
    }

    const roast = await prisma.roast.findUnique({
      where: { id }
    });

    if (!roast) {
      return NextResponse.json(
        { error: 'Roast not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(roast);
  } catch (error) {
    console.error('Roast retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve roast' },
      { status: 500 }
    );
  }
}
