import { put, del } from '@vercel/blob';

export async function uploadFile(
    fileName: string,
    file: Buffer,
    contentType: string
  ): Promise<{ url: string; cloud_storage_path: string }> {
    const blob = await put(`uploads/${Date.now()}-${fileName}`, file, {
          access: 'public',
          contentType,
    });
    return { url: blob.url, cloud_storage_path: blob.url };
}

export async function generatePresignedUploadUrl(
    fileName: string,
    contentType: string
  ): Promise<{ uploadUrl: string; cloud_storage_path: string }> {
    const placeholder = `uploads/${Date.now()}-${fileName}`;
    return { uploadUrl: '', cloud_storage_path: placeholder };
}

export async function getFileUrl(cloud_storage_path: string): Promise<string> {
    return cloud_storage_path;
}

export async function deleteFile(cloud_storage_path: string): Promise<void> {
    await del(cloud_storage_path);
}
