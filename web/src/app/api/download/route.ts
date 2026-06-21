import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const os = searchParams.get('os') || 'win';
  
  try {
    // Fetch latest release data from GitHub API
    const response = await fetch('https://api.github.com/repos/wachanga173/KenyaBooks/releases/latest', {
      next: { revalidate: 60 } // cache for 60 seconds to avoid rate limits
    });
    
    if (response.ok) {
      const data = await response.json();
      const assets = data.assets || [];
      let assetUrl = '';

      // Find the right asset for the requested OS
      if (os === 'mac') {
        const asset = assets.find((a: any) => a.name.endsWith('.dmg'));
        assetUrl = asset?.browser_download_url;
      } else if (os === 'linux') {
        const asset = assets.find((a: any) => a.name.endsWith('.AppImage'));
        assetUrl = asset?.browser_download_url;
      } else {
        const asset = assets.find((a: any) => a.name.endsWith('.exe'));
        assetUrl = asset?.browser_download_url;
      }

      if (assetUrl) {
        return NextResponse.redirect(assetUrl);
      }
    }
  } catch (error) {
    console.error('Failed to fetch latest release:', error);
  }

  // Fallback if something goes wrong
  return NextResponse.redirect('https://github.com/wachanga173/KenyaBooks/releases/latest');
}
