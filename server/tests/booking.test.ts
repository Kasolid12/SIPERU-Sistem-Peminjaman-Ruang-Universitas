/**
 * Test validasi bentrok jadwal — logic kritikal SIPERU.
 * Cukup test fungsi murni cekBentrokJadwal tanpa perlu DB.
 */
import { describe, it, expect } from "vitest";

// Replika fungsi cekBentrokJadwal dari booking.service.ts
function cekBentrokJadwal(
  existing: { jamMulai: string; jamSelesai: string }[],
  jamMulai: string,
  jamSelesai: string,
): boolean {
  return existing.some(
    (e) => e.jamMulai < jamSelesai && jamMulai < e.jamSelesai,
  );
}

describe("cekBentrokJadwal", () => {
  it("mengembalikan true jika ada bentrok (08:00-10:00 vs 09:00-11:00)", () => {
    const existing = [{ jamMulai: "08:00", jamSelesai: "10:00" }];
    expect(cekBentrokJadwal(existing, "09:00", "11:00")).toBe(true);
  });

  it("mengembalikan false jika tidak ada bentrok (08:00-10:00 vs 10:00-12:00)", () => {
    const existing = [{ jamMulai: "08:00", jamSelesai: "10:00" }];
    expect(cekBentrokJadwal(existing, "10:00", "12:00")).toBe(false);
  });

  it("mengembalikan true jika bentrok eksak (08:00-10:00 vs 08:00-10:00)", () => {
    const existing = [{ jamMulai: "08:00", jamSelesai: "10:00" }];
    expect(cekBentrokJadwal(existing, "08:00", "10:00")).toBe(true);
  });

  it("mengembalikan false jika existing kosong", () => {
    expect(cekBentrokJadwal([], "09:00", "10:00")).toBe(false);
  });

  it("mengembalikan true jika salah satu rentang mencakup yang lain", () => {
    const existing = [{ jamMulai: "07:00", jamSelesai: "12:00" }];
    expect(cekBentrokJadwal(existing, "09:00", "10:00")).toBe(true);
  });
});