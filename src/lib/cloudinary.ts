import { v2 as cloudinary } from "cloudinary";

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

export async function uploadResume(file: File, userId: string): Promise<string> {
  const client = getCloudinary();
  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    const uploadStream = client.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "resumes",
        public_id: `${userId}-${Date.now()}`,
      },
      (error, result) => {
        if (error || !result) {
          const message =
            error && typeof error === "object" && "message" in error && typeof error.message === "string"
              ? error.message
              : "Cloudinary upload failed.";
          reject(new Error(message));
          return;
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}
