import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  context: { params: { roomId: string } }
) {
  const { roomId } = context.params;

  // Fetch the count of users in the room
  const { count, error } = await supabase
    .from("room_users")
    .select("*", { count: "exact", head: true })
    .eq("room_id", roomId);

  if (error) {
    console.error("Error fetching user count:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ count }, { status: 200 });
}
