import { v2 as cloudinary, type UploadApiOptions } from "cloudinary";

function getCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

function uploadBuffer(
  client: ReturnType<typeof getCloudinary>,
  buffer: Buffer,
  options: UploadApiOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = client.uploader.upload_stream(options, (error, result) => {
      if (error || !result) {
        const message =
          error && typeof error === "object" && "message" in error && typeof error.message === "string"
            ? error.message
            : "Cloudinary upload failed.";
        reject(new Error(message));
        return;
      }
      resolve(result.secure_url);
    });
    uploadStream.end(buffer);
  });
}

export async function uploadResume(file: File, userId: string): Promise<string> {
  const client = getCloudinary();
  const buffer = Buffer.from(await file.arrayBuffer());

  return uploadBuffer(client, buffer, {
    resource_type: "raw",
    folder: "resumes",
    public_id: `${userId}-${Date.now()}`,
  });
}

export async function uploadProfileImage(file: File, userId: string): Promise<string> {
  const client = getCloudinary();
  const buffer = Buffer.from(await file.arrayBuffer());

  return uploadBuffer(client, buffer, {
    resource_type: "image",
    folder: "avatars",
    public_id: userId,
    overwrite: true,
    transformation: [{ width: 256, height: 256, crop: "fill", gravity: "face" }],
  });
}
