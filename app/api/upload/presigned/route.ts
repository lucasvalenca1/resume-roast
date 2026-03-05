import { NextRequest, NextResponse } from 'next/server';
import { generatePresignedUploadUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
          const body = await request?.json?.();
          const { fileName, contentType } = body ?? {};

      if (!fileName || !contentType) {
              return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
                      );
      }

      const { uploadUrl, cloud_storage_path } = await generatePresignedUploadUrl(
              fileName,
              contentType
            );

      return NextResponse.json({ uploadUrl, cloud_storage_path });
    } catch (error) {
          console.error('Presigned URL generation error:', error);
          return NextResponse.json(
            { error: 'Failed to generate upload URL' },
            { status: 500 }
                );
    }
}
