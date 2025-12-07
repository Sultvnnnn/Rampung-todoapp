// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🗑️  Menghapus data kategori lama...");
  // Hapus semua data kategori yang ada (Reset)
  await prisma.category.deleteMany();

  console.log("🌱  Menambahkan kategori baru dengan Dark Mode support...");

  // Data kategori baru dengan warna yang aman untuk Light & Dark Mode
  const categories = [
    {
      name: "Pribadi",
      color:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    },
    {
      name: "Pekerjaan",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    {
      name: "Belanja",
      color:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    },
    {
      name: "Kuliah",
      color:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    },
    {
      name: "Hiburan",
      color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    },
    {
      name: "Kesehatan",
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    },
    {
      name: "Ide",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    },
  ];

  // Masukkan ke database
  for (const cat of categories) {
    await prisma.category.create({
      data: cat,
    });
  }

  console.log("✅  Selesai! Database sudah diperbarui.");
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
