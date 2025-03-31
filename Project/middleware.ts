import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prewarmOllamaModel } from '@/lib/recommendations';

let hasWarmedUp = false;

export function middleware(request: NextRequest) {

  console.log(`Middleware processing: ${request.nextUrl.pathname}`)

  if (!hasWarmedUp) {
    console.log("First API request detected - warming up Ollama model");
    hasWarmedUp = true;

    try {
      // Add more debug logs
      console.log("About to call prewarmOllamaModel()");
      prewarmOllamaModel().then(success => {
        console.log(`Prewarming completed with status: ${success ? 'success' : 'failure'}`);
      }).catch(err => {
        console.error("Error in prewarmOllamaModel:", err);
      });
      console.log("Called prewarmOllamaModel() successfully");
    } catch (error) {
      console.error("Error in middleware when calling prewarmOllamaModel:", error);
    }
  }

  // Continue with the request
  return NextResponse.next()
}

// Only run middleware on API routes
export const config = {
  matcher: '/api/:path*',
}
