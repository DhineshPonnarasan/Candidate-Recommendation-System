import { NextResponse } from 'next/server'
export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log('Contact message received:', data)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
