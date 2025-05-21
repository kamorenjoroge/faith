// app/api/test/[id]/route.ts
import { NextResponse } from "next/server";
import dbConnect from '../../../../lib/dbConnect';
import Test from '../../../../models/Test';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params; // ✅ Extract `id` directly from `params`
    
    await dbConnect();
    const test = await Test.findById(id).lean(); // ✅ Use `id` directly

    if (!test) {
      return NextResponse.json({ message: "Test not found" }, { status: 404 });
    }

    return NextResponse.json(test);
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching test", error },
      { status: 500 }
    );
  }
}