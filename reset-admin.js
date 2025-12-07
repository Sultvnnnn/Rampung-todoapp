// reset-admin.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const email = "admin@admin.com";
  console.log(`🔍 Mencari user ${email}...`);

  // 1. Cari user dulu untuk dapat ID-nya
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log("User tidak ditemukan. Aman untuk seed.");
    return;
  }

  // 2. HAPUS TASKS
  console.log("🧹 Menghapus semua tugas milik admin terlebih dahulu...");
  await prisma.task.deleteMany({
    where: { userId: user.id },
  });

  // 3. HAPUS USERNYA
  console.log("🗑️ Menghapus user admin...");
  await prisma.user.delete({
    where: { id: user.id },
  });

  console.log("✅ Admin berhasil di-reset bersih! Silakan jalankan seed.");
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
