import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding...");

  //? Hashing
  const password = "admin123";
  const hashedPassword = await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10,
  });

  const user = await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: {
      password: hashedPassword,
    },
    create: {
      email: "admin@admin.com",
      name: "Sultan Abdul Fatah",
      password: hashedPassword,
    },
  });

  //? 1. Kategori
  const catKuliah = await prisma.category.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Kuliah",
      color: "bg-blue-100 text-blue-800",
    },
  });

  const catPribadi = await prisma.category.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: "Pribadi",
      color: "bg-purple-100 text-purple-800",
    },
  });

  const catBelanja = await prisma.category.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: "Belanja",
      color: "bg-green-100 text-green-800",
    },
  });

  //? 2. Tugas Dummy
  await prisma.task.createMany({
    data: [
      {
        title: "Mengerjakan Tugas UTS Frontend",
        isCompleted: false,
        categoryId: catKuliah.id,
        userId: user.id,
      },
      {
        title: "Beli kopi liong",
        isCompleted: true,
        categoryId: catBelanja.id,
        userId: user.id,
      },
      {
        title: "Jogging pagi 30 menit",
        isCompleted: false,
        categoryId: catPribadi.id,
        userId: user.id,
      },
    ],
  });

  console.log("Seeding selesai! Database sudah terisi");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
