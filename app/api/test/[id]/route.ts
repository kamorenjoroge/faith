import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Test from '../../../../models/Test';

// GET single test by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const test = await Test.findById(id);
    
    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(test);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch test' },
      { status: 500 }
    );
  }
}

// UPDATE single test by ID
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const body = await request.json();
    
    const updatedTest = await Test.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true
    });
    
    if (!updatedTest) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedTest);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to update test' },
      { status: 500 }
    );
  }
}

// DELETE single test by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const deletedTest = await Test.findByIdAndDelete(id);
    
    if (!deletedTest) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Test deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to delete test' },
      { status: 500 }
    );
  }
}