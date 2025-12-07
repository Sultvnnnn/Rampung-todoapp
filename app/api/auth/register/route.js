import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    //! VALIDASI
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Semua kolom harus diisi!" },
        { status: 400 }
      );
    }

    //! CEK EXIST
    const existUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar!" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPass } = newUser;
    return NextResponse.json(userWithoutPass, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mendaftar!" },
      { status: 500 }
    );
  }
}
