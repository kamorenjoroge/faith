import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Test from '../../../../models/Test';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    await dbConnect();
    const params = await context.params;
    const test = await Test.findById(params.id);
    
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

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    await dbConnect();
    const params = await context.params;
    const body = await request.json();
    
    const updatedTest = await Test.findByIdAndUpdate(params.id, body, {
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

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    await dbConnect();
    const params = await context.params;
    const deletedTest = await Test.findByIdAndDelete(params.id);
    
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