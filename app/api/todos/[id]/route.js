import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

//? 1. PATCH: update status (centang selesai/belum selesai)
export async function PATCH(request, { params }) {
  const { id } = await params;
  const taskId = parseInt(id);
  const body = await request.json();
  const { isCompleted } = body;

  try {
    const updateTask = await prisma.task.update({
      where: { id: taskId },
      data: { isCompleted },
    });
    return NextResponse.json(
      updateTask,
      { message: "Updated Successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Gagal update data" }, { status: 500 });
  }
}

//? 2. DELETE: menghapus data
export async function DELETE(request, { params }) {
  const { id } = await params;
  const taskId = parseInt(id);

  try {
    await prisma.task.delete({
      where: { id: taskId },
    });
    return NextResponse.json({ message: "Deleted Successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Gagal menghapus data" },
      { status: 500 }
    );
  }
}
