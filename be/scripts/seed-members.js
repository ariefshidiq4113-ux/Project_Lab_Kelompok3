/**
 * scripts/seed-members.js
 * Inject data anggota HIMAFOR ke MongoDB.
 *
 * Cara pakai:
 *   node scripts/seed-members.js          → upsert semua anggota
 *   node scripts/seed-members.js --reset  → hapus semua lalu insert ulang
 *
 * Aman dijalankan berulang — anggota di-upsert by NIM.
 * Password yang sudah diubah anggota TIDAK akan ditimpa ($setOnInsert).
 * Password awal = NIM masing-masing (sudah di-hash bcrypt di bawah).
 */

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ─── Koneksi ──────────────────────────────────────────────────────────────────

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌  MONGODB_URI belum diisi di .env");
  process.exit(1);
}

// ─── Data anggota ─────────────────────────────────────────────────────────────

const ANGGOTA = [
  // // ── Steering Committee ──────────────────────────────────────────────────────
   { nama: "Haikal Azkal Azkiya",        nim: "2488010038", jenisKelamin: "Laki-laki",   tempatLahir: "Jakarta",          tanggalLahir: "2006-05-24", noTelepon: "08989782522",   jabatan: "Ketua Umum",             departemen: "Steering Committee",                             email: "haikalazkal06@gmail.com" },
   { nama: "Muhammad 'Arif Nur Shidiq",  nim: "2488010022", jenisKelamin: "Laki-laki",   tempatLahir: "Cirebon",          tanggalLahir: "2005-07-25", noTelepon: "082118113252",  jabatan: "Wakil Ketua Umum",       departemen: "Steering Committee",                             email: "arief.shidiq4113@gmail.com" },
   { nama: "Tiara Salsabila",             nim: "2488010045", jenisKelamin: "Perempuan",   tempatLahir: "Cirebon",          tanggalLahir: "2006-03-17", noTelepon: "08888225949",   jabatan: "Sekretaris Umum I",      departemen: "Steering Committee",                             email: "tyrsalsabila@gmail.com" },
   { nama: "Wafah Khonia",                nim: "2530801081", jenisKelamin: "Perempuan",   tempatLahir: "Indramayu",        tanggalLahir: "2007-05-04", noTelepon: "083192851972",  jabatan: "Sekretaris Umum II",     departemen: "Steering Committee",                             email: "wafahkhonia3@gmail.com" },
   { nama: "Rifa'ah Fatihatu Sa'adah",   nim: "2488010008", jenisKelamin: "Perempuan",   tempatLahir: "Majalengka",       tanggalLahir: "2006-07-05", noTelepon: "082118134193",  jabatan: "Bendahara Umum I",       departemen: "Steering Committee",                             email: "rifasaa05@gmail.com" },
 { nama: "Azhalia Mozaik",              nim: "2530801059", jenisKelamin: "Perempuan",   tempatLahir: "Majalengka",       tanggalLahir: "2007-05-12", noTelepon: "089630530306",  jabatan: "Bendahara Umum II",      departemen: "Steering Committee",                             email: "mozaikazhalia@gmail.com" },
  // // ── DSA ─────────────────────────────────────────────────────────────────────
   { nama: "Nisa Naila",                  nim: "2488010024", jenisKelamin: "Perempuan",   tempatLahir: "Majalengka",       tanggalLahir: "2005-10-08", noTelepon: "085659325240",  jabatan: "Kepala Departemen",      departemen: "Department of Strategic Advocacy (DSA)",         kodeDepartemen: "DSA", email: "nisanailapr123@gmail.com" },
   { nama: "Nayla Sabryna",               nim: "2530801022", jenisKelamin: "Perempuan",   tempatLahir: "Indramayu",        tanggalLahir: "2005-05-12", noTelepon: "087712809656",  jabatan: "Sekretaris Departemen",  departemen: "Department of Strategic Advocacy (DSA)",         kodeDepartemen: "DSA", email: "geanandasabryna@gmail.com" },
   { nama: "Ananda Rizqi Kurniawan",      nim: "2530801036", jenisKelamin: "Laki-laki",   tempatLahir: "Cirebon",          tanggalLahir: "2006-11-01", noTelepon: "08993937479",   jabatan: "Bendahara Departemen",   departemen: "Department of Strategic Advocacy (DSA)",         kodeDepartemen: "DSA", email: "g45413219@gmail.com" },
   { nama: "Diandra Enka Nugraha",        nim: "2530801104", jenisKelamin: "Laki-laki",   tempatLahir: "Subang",           tanggalLahir: "2006-12-03", noTelepon: "085881314116",  jabatan: "Anggota Departemen",     departemen: "Department of Strategic Advocacy (DSA)",         kodeDepartemen: "DSA", email: "diandraenkanugraha@gmail.com" },
   { nama: "Maulana Azidan Ghoni",        nim: "2530801011", jenisKelamin: "Laki-laki",   tempatLahir: "Bekasi",           tanggalLahir: "2007-09-14", noTelepon: "087784007454",  jabatan: "Anggota Departemen",     departemen: "Department of Strategic Advocacy (DSA)",         kodeDepartemen: "DSA", email: "azidanghoni14@gmail.com" },
   { nama: "Taohid",                      nim: "2530801047", jenisKelamin: "Laki-laki",   tempatLahir: "Brebes",           tanggalLahir: "2007-05-23", noTelepon: "083117417650",  jabatan: "Anggota Departemen",     departemen: "Department of Strategic Advocacy (DSA)",         kodeDepartemen: "DSA", email: "taohidd123@gmail.com" },
  // // ── LEADE ───────────────────────────────────────────────────────────────────
   { nama: "Nayla Rahma Farhanah",        nim: "2488010026", jenisKelamin: "Perempuan",   tempatLahir: "Indramayu",        tanggalLahir: "2005-06-29", noTelepon: "082125385275",  jabatan: "Kepala Departemen",      departemen: "Department of Leadership Development and Engagement (LEADE)", kodeDepartemen: "LEADE", email: "naylanara89@gmail.com" },
   { nama: "Masdika Pahlepi Iskandar",    nim: "2530801014", jenisKelamin: "Laki-laki",   tempatLahir: "Oku Timur",        tanggalLahir: "2007-10-12", noTelepon: "085134947481",  jabatan: "Sekretaris Departemen",  departemen: "Department of Leadership Development and Engagement (LEADE)", kodeDepartemen: "LEADE", email: "masdikapahlepii51@gmail.com" },
   { nama: "Fitria Eka Rachmadani",       nim: "2530801006", jenisKelamin: "Perempuan",   tempatLahir: "Cirebon",          tanggalLahir: "2007-09-23", noTelepon: "082130482673",  jabatan: "Bendahara Departemen",   departemen: "Department of Leadership Development and Engagement (LEADE)", kodeDepartemen: "LEADE", email: "fitriarachmadani2309@gmail.com" },
   { nama: "Ananda Rasya Moppang Doli Harahap", nim: "2530801072", jenisKelamin: "Laki-laki", tempatLahir: "Jakarta",     tanggalLahir: "2006-09-18", noTelepon: "085161117734",  jabatan: "Anggota Departemen",     departemen: "Department of Leadership Development and Engagement (LEADE)", kodeDepartemen: "LEADE", email: "anandarasya325@gmail.com" },
   { nama: "Ghiyas Muharraran",           nim: "2530801007", jenisKelamin: "Laki-laki",   tempatLahir: "Pematangsiantar",  tanggalLahir: "2007-12-21", noTelepon: "0895628680899", jabatan: "Anggota Departemen",     departemen: "Department of Leadership Development and Engagement (LEADE)", kodeDepartemen: "LEADE", email: "muharraranghiyas@gmail.com" },
   { nama: "Ahmad Fadilah Syah",          nim: "2488010029", jenisKelamin: "Laki-laki",   tempatLahir: "Cirebon",          tanggalLahir: "2005-09-27", noTelepon: "085871435748",  jabatan: "Anggota Departemen",     departemen: "Department of Leadership Development and Engagement (LEADE)", kodeDepartemen: "LEADE" },
  // // ── DMPR ────────────────────────────────────────────────────────────────────
   { nama: "Abdullah Assegaf",            nim: "2488010076", jenisKelamin: "Laki-laki",   tempatLahir: "Cirebon",          tanggalLahir: "2004-09-27", noTelepon: "087716775287",  jabatan: "Kepala Departemen",      departemen: "Department of Moral and Public Relations (DMPR)",kodeDepartemen: "DMPR", email: "dolahsgf1@gmail.com" },
   { nama: "Nazwa Nabila",                nim: "2530801088", jenisKelamin: "Perempuan",   tempatLahir: "Cirebon",          tanggalLahir: "2007-01-18", noTelepon: "08812064830",   jabatan: "Sekretaris Departemen",  departemen: "Department of Moral and Public Relations (DMPR)",kodeDepartemen: "DMPR", email: "nazwanabillaa18@gmail.com" },
   { nama: "Rizky Fadilah",               nim: "2488010040", jenisKelamin: "Laki-laki",   tempatLahir: "Kuningan",         tanggalLahir: "2006-02-18", noTelepon: "083116544267",  jabatan: "Bendahara Departemen",   departemen: "Department of Moral and Public Relations (DMPR)",kodeDepartemen: "DMPR", email: "fadilrizky810@gmail.com" },
   { nama: "Abil Ghinaya Azka",           nim: "2530801056", jenisKelamin: "Laki-laki",   tempatLahir: "Tegal",            tanggalLahir: "2007-08-13", noTelepon: "0895700230123", jabatan: "Anggota Departemen",     departemen: "Department of Moral and Public Relations (DMPR)",kodeDepartemen: "DMPR", email: "ghinayaabil13@gmail.com" },
   { nama: "Kalin Aulia Haifa",           nim: "2530801068", jenisKelamin: "Perempuan",   tempatLahir: "Cirebon",          tanggalLahir: "2006-07-20", noTelepon: "081312733682",  jabatan: "Anggota Departemen",     departemen: "Department of Moral and Public Relations (DMPR)",kodeDepartemen: "DMPR", email: "kalinaulia204@gmail.com" },
   { nama: "Muhammad Majid Baihaqi",      nim: "2530801092", jenisKelamin: "Laki-laki",   tempatLahir: "Cirebon",          tanggalLahir: "2006-12-17", noTelepon: "083895375235",  jabatan: "Anggota Departemen",     departemen: "Department of Moral and Public Relations (DMPR)",kodeDepartemen: "DMPR", email: "majidbaihaqi24@gmail.com" },
  // // ── DIC ─────────────────────────────────────────────────────────────────────
   { nama: "Irfan Mubarok",               nim: "2488010075", jenisKelamin: "Laki-laki",   tempatLahir: "Cirebon",          tanggalLahir: "2006-02-17", noTelepon: "083804339441",  jabatan: "Kepala Departemen",      departemen: "Department of Information and Communications (DIC)", kodeDepartemen: "DIC", email: "irfanmubarok@mail.uinssc.ac.id" },
   { nama: "Ahmad Ali Murtadlo",          nim: "2488010056", jenisKelamin: "Laki-laki",   tempatLahir: "Cirebon",          tanggalLahir: "2006-02-11", noTelepon: "081572335164",  jabatan: "Sekretaris Departemen",  departemen: "Department of Information and Communications (DIC)", kodeDepartemen: "DIC" },
   { nama: "Lailatul Qodariah",           nim: "2488010006", jenisKelamin: "Perempuan",   tempatLahir: "Cirebon",          tanggalLahir: "2006-10-02", noTelepon: "083852406452",  jabatan: "Bendahara Departemen",   departemen: "Department of Information and Communications (DIC)", kodeDepartemen: "DIC", email: "lailatulqodariah021@gmail.com" },
   { nama: "Pasya Nur Rizki",             nim: "2488010052", jenisKelamin: "Laki-laki",   tempatLahir: "Cirebon",          tanggalLahir: "2006-03-11", noTelepon: "081572076865",  jabatan: "Anggota Departemen",     departemen: "Department of Information and Communications (DIC)", kodeDepartemen: "DIC", email: "pasyarizki@mail.uinssc.ac.id" },
   { nama: "Ahmad Da'il Mukarrom",        nim: "2530801015", jenisKelamin: "Laki-laki",   tempatLahir: "Pandeglang",       tanggalLahir: "2007-05-25", noTelepon: "083890248073",  jabatan: "Anggota Departemen",     departemen: "Department of Information and Communications (DIC)", kodeDepartemen: "DIC", email: "ahmad.dail.mukarrom@mail.uinssc.ac.id" },
   { nama: "Akbar Fabiansyah",            nim: "2530801016", jenisKelamin: "Laki-laki",   tempatLahir: "Cilegon",          tanggalLahir: "2007-03-02", noTelepon: "089603431805",  jabatan: "Anggota Departemen",     departemen: "Department of Information and Communications (DIC)", kodeDepartemen: "DIC" },
   { nama: "Nizar Aftana Nursya'ban",     nim: "2530801097", jenisKelamin: "Laki-laki",   tempatLahir: "Subang",           tanggalLahir: "2007-08-29", noTelepon: "0881022416234", jabatan: "Anggota Departemen",     departemen: "Department of Information and Communications (DIC)", kodeDepartemen: "DIC", email: "nizaraftana07@gmail.com" },
  // // ── EDUTECH ─────────────────────────────────────────────────────────────────
   { nama: "Dawwas Zakka Sutiono",        nim: "2488010015", jenisKelamin: "Laki-laki",   tempatLahir: "Purwakarta",       tanggalLahir: "2006-08-12", noTelepon: "085926116208",  jabatan: "Kepala Departemen",      departemen: "Department of Educational Science and Technology (EDUTECH)", kodeDepartemen: "EDUTECH", email: "dawwaszakka@gmail.com" },
   { nama: "Shafira Azzahra Riadi",       nim: "2530801043", jenisKelamin: "Perempuan",   tempatLahir: "Cirebon",          tanggalLahir: "2007-06-17", noTelepon: "085221227785",  jabatan: "Sekretaris Departemen",  departemen: "Department of Educational Science and Technology (EDUTECH)", kodeDepartemen: "EDUTECH", email: "azzahrashafira716@gmail.com" },
   { nama: "Much. Mentari Irwansyah",     nim: "2530801035", jenisKelamin: "Laki-laki",   tempatLahir: "Cirebon",          tanggalLahir: "2006-11-20", noTelepon: "0882001032640", jabatan: "Bendahara Departemen",   departemen: "Department of Educational Science and Technology (EDUTECH)", kodeDepartemen: "EDUTECH", email: "irwangg20@gmail.com" },
   { nama: "Tanu Hasyim",                 nim: "2488010011", jenisKelamin: "Laki-laki",   tempatLahir: "Tangerang",        tanggalLahir: "2006-05-10", noTelepon: "082231044662",  jabatan: "Anggota Departemen",     departemen: "Department of Educational Science and Technology (EDUTECH)", kodeDepartemen: "EDUTECH", email: "tunahisyam@gmail.com" },
   { nama: "Muhammad David Rizal Fahrezi",nim: "2530801050", jenisKelamin: "Laki-laki",   tempatLahir: "Rembang",          tanggalLahir: "2007-05-10", noTelepon: "08579881243",   jabatan: "Anggota Departemen",     departemen: "Department of Educational Science and Technology (EDUTECH)", kodeDepartemen: "EDUTECH", email: "muhammaddavid1057@gmail.com" },
   { nama: "Ahmad Syarifudin",            nim: "2530801032", jenisKelamin: "Laki-laki",   tempatLahir: "Grobogan",         tanggalLahir: "2006-12-28", noTelepon: "08986020028",   jabatan: "Anggota Departemen",     departemen: "Department of Educational Science and Technology (EDUTECH)", kodeDepartemen: "EDUTECH", email: "ahmadsyarifudin281226@gmail.com" },
   { nama: "Putra Rais Hakim",            nim: "2530801085", jenisKelamin: "Laki-laki",   tempatLahir: "Cirebon",          tanggalLahir: "2006-12-19", noTelepon: "0895328114260", jabatan: "Anggota Departemen",     departemen: "Department of Educational Science and Technology (EDUTECH)", kodeDepartemen: "EDUTECH", email: "raishakim847@gmail.com" },
   // ── DOTS ────────────────────────────────────────────────────────────────────
   { nama: "Ashfahani Hasyim",            nim: "2488010070", jenisKelamin: "Laki-laki",   tempatLahir: "Cirebon",          tanggalLahir: "2005-07-24", noTelepon: "085798004301",  jabatan: "Kepala Departemen",      departemen: "Department of Talent and Interests (DOTS)",      kodeDepartemen: "DOTS", email: "ashfahani77@gmail.com" },
   { nama: "Taufik Arrokhman",            nim: "2530801002", jenisKelamin: "Laki-laki",   tempatLahir: "Pelalawan",        tanggalLahir: "2006-12-02", noTelepon: "082333838438",  jabatan: "Sekretaris Departemen",  departemen: "Department of Talent and Interests (DOTS)",      kodeDepartemen: "DOTS", email: "taoefik.arrokhman@gmail.com" },
   { nama: "Bintang Mutiara 'Arsy",       nim: "2530801082", jenisKelamin: "Perempuan",   tempatLahir: "Cirebon",          tanggalLahir: "2007-05-24", noTelepon: "081224494938",  jabatan: "Bendahara Departemen",   departemen: "Department of Talent and Interests (DOTS)",      kodeDepartemen: "DOTS", email: "bintangmutiaraarsyy@gmail.com" },
   { nama: "Al Farid Maulani",            nim: "2530801025", jenisKelamin: "Laki-laki",   tempatLahir: "Cirebon",          tanggalLahir: "2005-02-17", noTelepon: "081224383705",  jabatan: "Anggota Departemen",     departemen: "Department of Talent and Interests (DOTS)",      kodeDepartemen: "DOTS", email: "alfaridmaulani4@gmail.com" },
   { nama: "Fadhila Itmamul Fiqri",       nim: "2530801083", jenisKelamin: "Laki-laki",   tempatLahir: "Banjar",           tanggalLahir: "2007-05-29", noTelepon: "085872316765",  jabatan: "Anggota Departemen",     departemen: "Department of Talent and Interests (DOTS)",      kodeDepartemen: "DOTS", email: "fadilofficial290507@gmail.com" },
   { nama: "Muhammad Ismail Aulia",       nim: "2530801052", jenisKelamin: "Laki-laki",   tempatLahir: "Tangerang",        tanggalLahir: "2007-01-16", noTelepon: "081299936513",  jabatan: "Anggota Departemen",     departemen: "Department of Talent and Interests (DOTS)",      kodeDepartemen: "DOTS", email: "ismailaulia89@gmail.com" },
   // ── DCE ─────────────────────────────────────────────────────────────────────
   { nama: "Moh. Farid Ilham Ghifari",    nim: "2488010066", jenisKelamin: "Laki-laki",   tempatLahir: "Subang",           tanggalLahir: "2006-02-03", noTelepon: "083156623352",  jabatan: "Kepala Departemen",      departemen: "Department of Creative Economy (DCE)",           kodeDepartemen: "DCE", email: "faridilham0302@gmail.com" },
  { nama: "Lutfiyah",                    nim: "2530801060", jenisKelamin: "Perempuan",   tempatLahir: "Cirebon",          tanggalLahir: "2008-08-17", noTelepon: "082246927882",  jabatan: "Sekretaris Departemen",  departemen: "Department of Creative Economy (DCE)",           kodeDepartemen: "DCE", email: "lululutfiyah1708@gmail.com" },
   { nama: "Yohanes David",               nim: "2530801100", jenisKelamin: "Laki-laki",   tempatLahir: "Cirebon",          tanggalLahir: "2007-03-09", noTelepon: "0895428570104", jabatan: "Bendahara Departemen",   departemen: "Department of Creative Economy (DCE)",           kodeDepartemen: "DCE", email: "yohanesdavid039@gmail.com" },
   { nama: "Avis Budiman Tauladani",      nim: "2488010002", jenisKelamin: "Laki-laki",   tempatLahir: "Cirebon",          tanggalLahir: "2005-11-23", noTelepon: "0882001597176", jabatan: "Anggota Departemen",     departemen: "Department of Creative Economy (DCE)",           kodeDepartemen: "DCE", email: "avisbudiman@gmail.com" },
  { nama: "Agung Dwi Jaya",              nim: "2530801093", jenisKelamin: "Laki-laki",   tempatLahir: "Cirebon",          tanggalLahir: "2007-12-17", noTelepon: "085757503369",  jabatan: "Anggota Departemen",     departemen: "Department of Creative Economy (DCE)",           kodeDepartemen: "DCE", email: "agungdwijaya1712@gmail.com" },
  { nama: "Muhammad Raffi",   nim: "2488010046", jenisKelamin: "Laki-laki",   tempatLahir: "Tangerang",        tanggalLahir: "2006-09-08", noTelepon: "085871815705",  jabatan: "Anggota Departemen",     departemen: "Department of Creative Economy (DCE)",           kodeDepartemen: "DCE", email: "raffi38321@gmail.com" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

const isReset = process.argv.includes("--reset");

async function main() {
  await mongoose.connect(MONGODB_URI, { dbName: "presensi_pintar" });
  console.log("✅  Terhubung ke MongoDB");

  const col = mongoose.connection.db.collection("members");

  if (isReset) {
    await col.deleteMany({});
    console.log("🗑️   Collection members dikosongkan");
  }

  const sekarang = new Date();
  let inserted = 0;
  let updated = 0;

  for (const a of ANGGOTA) {
    // Hash password dari NIM
    const passwordHash = await bcrypt.hash(a.nim, 10);

    const { tanggalLahir, ...rest } = a;

    const result = await col.updateOne(
      { nim: a.nim },
      {
        $set: {
          ...rest,
          tanggalLahir: new Date(tanggalLahir),
          updatedAt: sekarang,
        },
        $setOnInsert: {
          // Password hanya diset saat insert baru — tidak menimpa yang sudah diubah
          passwordHash,
          mustChangePassword: true,
          aktif: true,
          createdAt: sekarang,
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) inserted++;
    else if (result.modifiedCount > 0) updated++;
  }

  const total = await col.countDocuments();
  console.log(`\n📊  Hasil:`);
  console.log(`   Baru ditambahkan : ${inserted}`);
  console.log(`   Diperbarui       : ${updated}`);
  console.log(`   Total di database: ${total}`);
  console.log(`\n🔑  Password awal setiap anggota = NIM masing-masing`);
}

main()
  .catch((err) => {
    console.error("❌  Error:", err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
