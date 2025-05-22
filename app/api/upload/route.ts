import { NextResponse } from 'next/server';
import cloudinary from '../../../lib/cloudinary';
import ImageModel from '../../../models/ImageModel';
import dbConnect from '../../../lib/dbConnect';

export async function POST(request: Request) {
  try {
    // Connect to MongoDB first
    await dbConnect();

    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files received' }, { status: 400 });
    }

    // Upload images to Cloudinary
    const uploadPromises = files.map(async (file) => {
      const buffer = await file.arrayBuffer();
      const array = new Uint8Array(buffer);
      
      return new Promise<string>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'product' },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(result!.secure_url);
          }
        ).end(array);
      });
    });

    const imageUrls = await Promise.all(uploadPromises);

    // Save to MongoDB with timeout handling
    const savedImages = await Promise.race([
      ImageModel.create({ images: imageUrls }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database operation timed out')), 15000)
      )
    ]);

    return NextResponse.json({
      message: 'Images uploaded successfully',
      data: savedImages
    });

  } catch (error: unknown) {
    console.error('Error uploading images:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to upload images';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}