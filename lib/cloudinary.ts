import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Transformation applied to every uploaded image so the homepage stays fast:
 * caps the width, strips heavy metadata and lets Cloudinary pick an optimal
 * format + quality automatically (q_auto / f_auto).
 */
const HOMEPAGE_TRANSFORMATION = {
  quality: "auto:good",
  fetch_format: "auto",
  flags: "strip_profile",
};

export async function uploadImage(file: string, folder: string = "prosumer-lens") {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: "auto",
      transformation: HOMEPAGE_TRANSFORMATION,
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
}

export async function deleteImage(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
}

export default cloudinary;
