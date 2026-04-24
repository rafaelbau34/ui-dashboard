 import { NextResponse } from "next/server";
 import { getProjectTasks } from "@/lib/db/queries";
 
 export const dynamic = "force-dynamic";
 
 export async function GET(
   _req: Request,
   { params }: { params: Promise<{ id: string }> }
 ) {
   const { id } = await params;
   const projectId = Number(id);
   if (!Number.isFinite(projectId)) {
     return NextResponse.json({ tasks: [] }, { status: 400 });
   }
 
   const tasks = await getProjectTasks(projectId);
   return NextResponse.json({ tasks });
 }
