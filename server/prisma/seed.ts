/**
 * Seeder SIPERU — idempoten (aman dijalankan berulang).
 * Isi: 10 pengguna (2 admin + 8 dosen), 10 ruang, dan contoh peminjaman.
 *
 * Jalankan: `npm run seed` (tsx prisma/seed.ts)
 */
import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";
import { DUMMY_PASSWORD } from "../src/utils/seedPasswords";

const adapter = new PrismaMariaDb(
  (process.env.DATABASE_URL ?? "mysql://root@localhost:3306/siperu").replace(/^mysql:\/\//, "mariadb://"),
);
const prisma = new PrismaClient({ adapter });

/** Offset tanggal relatif hari ini agar data selalu relevan saat demo. */
function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

async function seedUsers() {
  const users = [
    { nama: "Administrator Utama", email: "admin@siperu.ac.id", role: "ADMIN" as const },
    { nama: "Administrator Operasional", email: "admin2@siperu.ac.id", role: "ADMIN" as const },
    ...[
      "Dr. Ahmad Fauzi",
      "Dr. Budi Santoso",
      "Dra. Citra Lestari",
      "Drs. Dedi Kurniawan",
      "Eka Putri, M.Kom",
      "Fajar Ramadhan, M.T.",
      "Dr. Gita Anggraini",
      "Hendra Wijaya, M.Si",
    ].map((nama, i) => ({
      nama,
      email: `dosen${i + 1}@siperu.ac.id`,
      role: "DOSEN" as const,
    })),
  ];

  const passwordHash = await bcrypt.hash(DUMMY_PASSWORD, 10);
  let created = 0;
  for (const u of users) {
    const exists = await prisma.user.findUnique({ where: { email: u.email } });
    if (!exists) {
      await prisma.user.create({ data: { ...u, password: passwordHash } });
      created += 1;
    }
  }
  console.log(`👤 Users: ${created} dibuat (total ${await prisma.user.count()})`);
}

async function seedRooms() {
  const rooms = [
    { nama: "Ruang Kuliah A-101", lokasi: "Gedung A — Lantai 1", kapasitas: 40 },
    { nama: "Ruang Kuliah A-102", lokasi: "Gedung A — Lantai 1", kapasitas: 40 },
    { nama: "Ruang Seminar A", lokasi: "Gedung A — Lantai 2", kapasitas: 80 },
    { nama: "Ruang Rapat Jurusan", lokasi: "Gedung A — Lantai 2", kapasitas: 20 },
    { nama: "Ruang Kuliah B-201", lokasi: "Gedung B — Lantai 2", kapasitas: 45 },
    { nama: "Aula Gedung B", lokasi: "Gedung B — Lantai 1", kapasitas: 200 },
    { nama: "Lab Komputer C-101", lokasi: "Gedung C — Lantai 1", kapasitas: 30 },
    { nama: "Ruang Sidang C", lokasi: "Gedung C — Lantai 2", kapasitas: 30 },
    { nama: "Ruang Kuliah C-102", lokasi: "Gedung C — Lantai 1", kapasitas: 35 },
    { nama: "Ruang Rapat Dekanat", lokasi: "Gedung A — Lantai 3", kapasitas: 15 },
  ];

  let created = 0;
  for (const r of rooms) {
    const exists = await prisma.room.findFirst({ where: { nama: r.nama, externalId: null } });
    if (!exists) {
      await prisma.room.create({ data: r });
      created += 1;
    }
  }
  console.log(`🏠 Rooms: ${created} dibuat (total ${await prisma.room.count()})`);
}

async function seedBookings() {
  const count = await prisma.booking.count();
  if (count > 0) {
    console.log(`📅 Bookings: sudah ada ${count}, dilewati.`);
    return;
  }

  const dosen = await prisma.user.findMany({ where: { role: "DOSEN" }, take: 5 });
  const rooms = await prisma.room.findMany({ take: 5 });

  const bookings = [
    { roomId: rooms[0]!.id, userId: dosen[0]!.id, tanggal: daysFromNow(1), jamMulai: "08:00", jamSelesai: "10:00", keperluan: "Kuliah Pengantar Teknologi Informasi", status: "MENUNGGU" },
    { roomId: rooms[1]!.id, userId: dosen[1]!.id, tanggal: daysFromNow(1), jamMulai: "10:00", jamSelesai: "12:00", keperluan: "Kuliah Basis Data", status: "MENUNGGU" },
    { roomId: rooms[2]!.id, userId: dosen[2]!.id, tanggal: daysFromNow(2), jamMulai: "09:00", jamSelesai: "11:00", keperluan: "Seminar Nasional AI", status: "DISETUJUI" },
    { roomId: rooms[3]!.id, userId: dosen[3]!.id, tanggal: daysFromNow(3), jamMulai: "13:00", jamSelesai: "15:00", keperluan: "Rapat Evaluasi Kurikulum", status: "DITOLAK" },
    { roomId: rooms[4]!.id, userId: dosen[4]!.id, tanggal: daysFromNow(-2), jamMulai: "08:00", jamSelesai: "10:00", keperluan: "Kuliah Pemrograman Web (sudah selesai)", status: "SELESAI" },
  ] as const;

  for (const b of bookings) {
    await prisma.booking.create({
      data: {
        roomId: b.roomId,
        userId: b.userId,
        tanggal: b.tanggal,
        jamMulai: b.jamMulai,
        jamSelesai: b.jamSelesai,
        keperluan: b.keperluan,
        status: b.status,
      },
    });
  }
  console.log(`📅 Bookings: ${bookings.length} contoh dibuat.`);
}

async function main() {
  await seedUsers();
  await seedRooms();
  await seedBookings();
  console.log("✅ Seeder selesai.");
}

main()
  .catch((e) => {
    console.error("❌ Seeder gagal:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
