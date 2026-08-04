# SIPERU — Sistem Peminjaman Ruang Universitas

<div align="center">
  <p>
    <strong>Sistem Informasi manajemen peminjaman ruang berbasis web untuk lingkungan universitas.</strong>
    <br />
    Dibangun dengan Express.js + Prisma + React + TypeScript.
  </p>

  <p>
    <a href="#-fitur">Fitur</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-arsitektur">Arsitektur</a> •
    <a href="#-panduan-setup">Panduan Setup</a> •
    <a href="#-api-endpoints">API Endpoints</a> •
    <a href="#-testing">Testing</a>
  </p>
</div>

---

## 📋 Fitur

### Tier 1 — Jalur Kritis ✅
| Fitur | Status |
|---|---|
| Setup project + DB + Prisma schema + migration | ✅ |
| Seeder (10 ruang, 10 pengguna — admin & dosen) | ✅ |
| Auth (register/login, JWT, middleware role) | ✅ |
| CRUD Data Ruang | ✅ |
| Sinkronisasi ruang dari webservice eksternal | ✅ |
| CRUD Pengajuan Peminjaman + validasi bentrok jadwal | ✅ |
| Approval/Reject oleh Admin | ✅ |

### Tier 2 — Pendukung ✅
| Fitur | Status |
|---|---|
| Dashboard ringkasan admin | ✅ |
| Pencarian & filter ruang | ✅ |
| Filter status peminjaman | ✅ |

### Tier 3 — Polish ✅
| Fitur | Status |
|---|---|
| UI responsif & tema profesional | ✅ |
| README lengkap | ✅ |

---

## 🚀 Tech Stack

| Layer | Teknologi | Keterangan |
|---|---|---|
| **Frontend** | React 19 + Vite 8 + TypeScript 6 | SPA cepat, tanpa overhead SSR |
| **Backend** | Express 5 + TypeScript 7 | Ringan, clean architecture |
| **ORM & Migration** | Prisma 7 | Schema-first, type-safe queries |
| **Database** | MySQL/MariaDB (via XAMPP) | Stabil, bisa diganti PostgreSQL |
| **Auth** | JWT (bcrypt + jsonwebtoken) | Native, tanpa pihak ketiga |
| **Data Fetching** | TanStack Query + Axios | Caching & state management |
| **Styling** | TailwindCSS 4 | Utility-first, tema kustom |
| **Validation** | Zod 4 | Runtime type safety |
| **Testing** | Vitest + Supertest | Unit test backend |

---

## 🏗️ Arsitektur

### Clean Architecture — `Controller → Service → Repository`

```
client/                          # React + Vite frontend
├── src/
│   ├── components/shared/       # StatusBadge, Layout, Loading
│   ├── pages/
│   │   ├── auth/                # LoginPage
│   │   ├── admin/               # Dashboard, ManageRooms, Approvals
│   │   └── dosen/               # Dashboard, NewBooking, History
│   ├── services/                # api.ts, auth.ts, rooms.ts, bookings.ts, dashboard.ts
│   ├── store/                   # AuthContext (JWT state management)
│   └── types/                   # TypeScript interfaces & constants

server/                          # Express backend
├── src/
│   ├── controllers/             # HTTP layer — tipis, hanya orkestrasi
│   ├── services/                # Business logic — validasi bentrok, dll.
│   ├── repositories/            # Akses Prisma — dipisah dari service
│   ├── middlewares/             # auth.middleware, role.middleware, error handler
│   ├── validators/              # Zod schema per endpoint
│   ├── routes/                  # Router Express per resource
│   ├── config/                  # env.ts, prisma.ts
│   └── utils/                   # jwt.ts, httpError.ts
├── prisma/
│   ├── schema.prisma            # Model User, Room, Booking
│   ├── seed.ts                  # 10 user + 10 ruang + contoh booking
│   └── migrations/              # Migrasi database
```

### 📐 Prinsip Desain
- **Controller** tidak boleh langsung memanggil Prisma
- **Service** berisi semua aturan bisnis (termasuk validasi bentrok jadwal)
- **Repository** sebagai satu-satunya akses ke database
- **Zod validators** di setiap endpoint untuk keamanan input

---

## 🔐 Validasi Bentrok Jadwal

Salah satu fitur paling kritis dengan aturan berikut:

Dua peminjaman dianggap **BENTROK** jika memenuhi **SEMUA** kondisi:
1. `roomId` sama (ruang yang sama)
2. Status peminjaman lain = `DISETUJUI` (hanya jadwal terkonfirmasi yang memblokir)
3. `tanggal` sama
4. Rentang waktu **beririsan**: `jamMulai_A < jamSelesai_B` **DAN** `jamMulai_B < jamSelesai_A`

Cek dilakukan saat:
- **Pembuatan pengajuan baru** (dosen)
- **Approval oleh admin** (cek ulang bentrok dengan booking DISETUJUI lainnya)

---

## 📦 Panduan Setup

### Prasyarat
- Node.js 20+
- **XAMPP** (atau MariaDB/MySQL server) — atau PostgreSQL
- npm / pnpm

### 1. Clone Repository

```bash
git clone https://github.com/Kasolid12/SIPERU-Sistem-Peminjaman-Ruang-Universitas.git
cd SIPERU-Sistem-Peminjaman-Ruang-Universitas
```

### 2. Setup Database

**Opsi A — XAMPP (MariaDB)**
- Jalankan XAMPP Control Panel
- Start **Apache** dan **MySQL**
- Buka phpMyAdmin (`http://localhost/phpmyadmin`)
- Buat database baru: `siperu`

**Opsi B — MySQL/MariaDB via CLI**
```bash
mysql -u root -p -e "CREATE DATABASE siperu;"
```

### 3. Setup Backend

```bash
cd server
cp .env.example .env
# Edit .env sesuai konfigurasi database Anda
npm install
npx prisma db push
npx prisma db seed
```

### 4. Setup Frontend

```bash
cd ../client
npm install
```

### 5. Jalankan Aplikasi

```bash
# Terminal 1 — Backend (dari folder server)
npm run dev

# Terminal 2 — Frontend (dari folder client)
npm run dev
```

- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:4000`
- **Health Check:** `http://localhost:4000/api/health`

---

## 🧪 Testing

```bash
cd server
npm test
```

### 5 Test Wajib
1. **Auth — Login berhasil** → kredensial valid mengembalikan JWT
2. **Auth — Login gagal** → password salah mengembalikan 401
3. **Role middleware** → endpoint admin ditolak untuk user DOSEN
4. **Validasi bentrok** → booking dengan jam bentrok ditolak (409)
5. **CRUD Ruang** → admin bisa membuat ruang baru

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `POST` | `/api/auth/register` | ✗ | Registrasi user baru (role = DOSEN) |
| `POST` | `/api/auth/login` | ✗ | Login, dapatkan JWT |
| `GET` | `/api/auth/me` | ✓ | Info user saat ini |

### Ruang
| Method | Endpoint | Auth | Role | Deskripsi |
|---|---|---|---|---|
| `GET` | `/api/rooms` | ✓ | * | List ruang (dengan filter search) |
| `GET` | `/api/rooms/:id` | ✓ | * | Detail ruang |
| `POST` | `/api/rooms` | ✓ | ADMIN | Tambah ruang baru |
| `POST` | `/api/rooms/sync` | ✓ | ADMIN | Sinkronisasi dari webservice eksternal |
| `PUT` | `/api/rooms/:id` | ✓ | ADMIN | Update ruang |
| `DELETE` | `/api/rooms/:id` | ✓ | ADMIN | Hapus ruang |

### Peminjaman
| Method | Endpoint | Auth | Role | Deskripsi |
|---|---|---|---|---|
| `GET` | `/api/bookings` | ✓ | * | List peminjaman (filter status/tanggal) |
| `GET` | `/api/bookings/:id` | ✓ | * | Detail peminjaman |
| `POST` | `/api/bookings` | ✓ | * | Buat pengajuan baru |
| `DELETE` | `/api/bookings/:id` | ✓ | * | Batalkan (status MENUNGGU saja) |
| `PATCH` | `/api/bookings/:id/status` | ✓ | ADMIN | Approve/Reject |

### Dashboard
| Method | Endpoint | Auth | Role | Deskripsi |
|---|---|---|---|---|
| `GET` | `/api/dashboard/summary` | ✓ | ADMIN | Ringkasan: total ruang, booking, per status |

---

## 👤 Akun Dummy (Seeder)

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@siperu.ac.id` | `password123` |
| **Admin** | `admin2@siperu.ac.id` | `password123` |
| **Dosen** | `dosen1@siperu.ac.id` | `password123` |
| **Dosen** | `dosen2@siperu.ac.id` | `password123` |
| **Dosen** | `dosen3@siperu.ac.id` | `password123` |
| **Dosen** | `dosen4@siperu.ac.id` | `password123` |
| **Dosen** | `dosen5@siperu.ac.id` | `password123` |
| **Dosen** | `dosen6@siperu.ac.id` | `password123` |
| **Dosen** | `dosen7@siperu.ac.id` | `password123` |
| **Dosen** | `dosen8@siperu.ac.id` | `password123` |

---

## 🎨 Tema Visual

Sistem warna status konsisten di seluruh aplikasi:

| Status | Warna | Hex |
|---|---|---|
| **Menunggu** | Amber lembut | `#C08A3E` |
| **Disetujui** | Sage green | `#5F8D6B` |
| **Ditolak** | Rose muted | `#B4574F` |
| **Selesai** | Abu netral | `#6B7280` |

- **Palet utama:** `#3B4A6B` (slate blue — profesional, akademik)
- **Latar:** `#F7F8FA` (off-white kebiruan)
- **Tipografi:** Plus Jakarta Sans (body) + Lora (heading dashboard)
- **Radius:** 8px (sedang), shadow tipis

---

## 📝 Riwayat Commit

```
chore: update gitignore untuk freebuff & agent skills
feat: setup frontend react dengan halaman auth, admin & dosen
feat: implement auth, crud ruang, peminjaman & approval
chore: setup prisma schema, migration & seed
chore: init project structure (client & server scaffold)
```

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan **Tes Bidang Programmer** — tidak untuk distribusi publik.

---

<p align="center">
  Dibangun dengan ❤️ menggunakan Express.js, Prisma, React, dan TypeScript
</p>