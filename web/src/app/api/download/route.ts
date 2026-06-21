import { NextResponse } from 'next/server';

export async function GET() {
  // In a real Vercel environment, we would increment the KV counter here:
  // import { kv } from '@vercel/kv';
  // await kv.incr('downloads:windows');
  
  // For MVP, redirect to the GitHub Release URL.
  // Replace with the actual GitHub Release URL once published.
  const GITHUB_RELEASE_URL = 'https://github.com/wachanga173/KenyaBooks/releases/download/v1.0.0/Kenya%20Accounting-1.0.0-Setup.exe';
  
  return NextResponse.redirect(GITHUB_RELEASE_URL);
}
