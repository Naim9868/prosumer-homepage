import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "prosumer-lens";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert buffer to base64
    const fileBase64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload to Cloudinary with homepage-optimized transformations
    const result = await cloudinary.uploader.upload(fileBase64, {
      folder,
      resource_type: "auto",
      transformation: {
        quality: "auto:good",
        fetch_format: "auto",
        flags: "strip_profile",
      },
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("publicId");

    if (!publicId) {
      return NextResponse.json({ error: "No publicId provided" }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      return NextResponse.json({ success: true, result: result.result });
    } else {
      return NextResponse.json({ error: `Failed to delete: ${result.result}` }, { status: 500 });
    }
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
