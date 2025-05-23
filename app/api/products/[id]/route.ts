// app/api/product/[id]/route.ts
import { NextResponse } from 'next/server';
import cloudinary from '../../../../lib/cloudinary';
import dbConnect from '../../../../lib/dbConnect';
import Product from '../../../../models/Products';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const awaitedParams = await params;
    const product = await Product.findById(awaitedParams.id);
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, data: product },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error fetching product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const awaitedParams = await params;
    
    const formData = await request.formData();
    
    // Extract text fields
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const quantity = parseInt(formData.get('quantity') as string) || 1;
    const details = formData.get('details') as string;
    const color = formData.get('color') as string;
    
    // Get existing product to preserve existing images if no new ones are uploaded
    const existingProduct = await Product.findById(awaitedParams.id);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    let imageUrls = [...existingProduct.images];
    
    // Process new images if any
    const imageFiles = formData.getAll('images') as File[];
    if (imageFiles.length > 0 && imageFiles[0].size > 0) {
      // Clear existing images if new ones are being uploaded
      imageUrls = [];
      
      for (const file of imageFiles) {
        const buffer = await file.arrayBuffer();
        const array = new Uint8Array(buffer);
        
        const result = await new Promise<string>((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'products' },
            (error, result) => {
              if (error) {
                reject(error);
                return;
              }
              resolve(result!.secure_url);
            }
          ).end(array);
        });
        
        imageUrls.push(result);
      }
    }
    
    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      awaitedParams.id,
      {
        name,
        price,
        quantity,
        details,
        color,
        images: imageUrls
      },
      {
        new: true,
        runValidators: true
      }
    );
    
    return NextResponse.json(
      { success: true, data: updatedProduct },
      { status: 200 }
    );
    
  } catch (error: unknown) {
    console.error('Error updating product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const awaitedParams = await params;
    
    const deletedProduct = await Product.findByIdAndDelete(awaitedParams.id);
    
    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, data: {} },
      { status: 200 }
    );
    
  } catch (error: unknown) {
    console.error('Error deleting product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 }
    );
  }
}