//api/test/%7Bid%7D/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Test from '../../../../models/Test';

// DELETE by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    // Find and delete the test
    const deletedTest = await Test.findByIdAndDelete(id);
    
    if (!deletedTest) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Test deleted successfully', test: deletedTest },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to delete test' },
      { status: 500 }
    );
  }
}

