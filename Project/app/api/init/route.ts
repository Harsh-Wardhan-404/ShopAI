import { NextResponse } from "next/server";
import { prewarmOllamaModel } from "@/lib/recommendations";

// This will be called once when the first request to any API route happens
let warmedUp = false;

export async function GET() {
  if (!warmedUp) {
    console.log("Initializing Ollama model...");
    warmedUp = true;
    // Don't await - let it run in background
    prewarmOllamaModel().then(success => {
      console.log(`Ollama warm-up ${success ? "completed successfully" : "failed"}`);
    });
  }
  
  return NextResponse.json({ initialized: true });
}