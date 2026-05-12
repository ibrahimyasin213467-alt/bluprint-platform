import { NextResponse } from 'next/server';
import { getActivities } from '@/app/lib/activity';

export async function GET() {
  try {
    const activities = await getActivities(50);
    return NextResponse.json({ success: true, activities });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}