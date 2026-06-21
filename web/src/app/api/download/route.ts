import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const os = searchParams.get('os') || 'win';
  
  let fileName = 'Kenya.Accounting-1.0.0-Setup.exe';
  if (os === 'mac') {
    fileName = 'Kenya.Accounting-1.0.0-Mac.dmg';
  } else if (os === 'linux') {
    fileName = 'Kenya.Accounting-1.0.0-Linux.AppImage';
  }

  const GITHUB_RELEASE_URL = `https://github.com/wachanga173/KenyaBooks/releases/download/v1.0.0/${fileName}`;
  
  return NextResponse.redirect(GITHUB_RELEASE_URL);
}
