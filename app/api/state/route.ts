import { NextResponse } from "next/server";
import { loadChainState } from "@/lib/chain-state";
import { demoState } from "@/lib/demo-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = await loadChainState();
    return NextResponse.json(state);
  } catch (error) {
    return NextResponse.json(
      {
        ...demoState,
        stats: {
          ...demoState.stats,
          error: error instanceof Error ? error.message : "Chain read failed",
        },
      },
      { status: 200 },
    );
  }
}
