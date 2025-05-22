// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import dbConnect from '../../../lib/dbConnect';
import Product from '../../../models/Products';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const formData = await request.formData();
    
    // Extract text fields
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const quantity = parseInt(formData.get('quantity') as string) || 1;
    const details = formData.get('details') as string;
    const color = formData.get('color') as string;
    
    // Process images
    const imageFiles = formData.getAll('images') as File[];
    const imagePaths: string[] = [];
    
    for (const file of imageFiles) {
      // Convert file to buffer
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Create unique filename
      const filename = Date.now() + '_' + file.name.replace(/\s+/g, '_');
      const relativePath = `/images/${filename}`;
      const filePath = path.join(process.cwd(), 'public', relativePath);
      
      // Write file to public/images folder
      await writeFile(filePath, buffer);
      
      imagePaths.push(relativePath);
    }
    
    // Create new product
    const product = await Product.create({
      name,
      price,
      quantity,
      details,
      color,
      images: imagePaths
    });
    
    return NextResponse.json(
      { success: true, data: product },
      { status: 201 }
    );
    
  
  } catch (error: unknown) {
    console.error('Error creating product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    
    const products = await Product.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(
      { success: true, data: products },
      { status: 200 }
    );
    
  } catch (error: unknown) { // Handle errors not to be any type 
    console.error('Error fetching products:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 }
    );
  }
  }
