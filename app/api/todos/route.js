import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

//? 1. GET: Mengambil semua data
export async function GET(request) {
  //! CEK SIAPA YG LOGIN
  const session = await getServerSession(authOptions);

  //! tolak akses jika blm login
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") || "";

  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId: parseInt(session.user.id),
        title: {
          contains: search, //* -> Fitur pencarian
        },
      },
      include: {
        category: true, //* -> Menyertakan data kategori
      },
      orderBy: {
        createdAt: "desc", //* -> Urutan dari yang terbaru
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

//? 2. POST: Menambahkan data
export async function POST(request) {
  const session = await getServerSession(authOptions);

  //! tolak akses jika blm login
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    console.log("DATA YANG DITERIMA:", body);
    console.log("Title:", body.title);
    console.log("CategoryId:", body.categoryId);

    const { title, categoryId } = body;

    //! Validasi
    if (!title || !categoryId) {
      return NextResponse.json(
        { error: "Judul dan Kategori wajib diisi" },
        { status: 400 }
      );
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        categoryId: parseInt(categoryId), //? -> Mengubah string menjadi integer
        userId: parseInt(session.user.id),
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Gagal menambahkan data" },
      { status: 500 }
    );
  }
}
