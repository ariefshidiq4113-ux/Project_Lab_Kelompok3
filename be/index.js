// =====================================================================
// Presensi Pintar (HIMAFOR) - setup database MongoDB lewat Node.js + Mongoose
// Jalankan:  node getting-started.js
// Aman dijalankan berulang: collection/index tidak dibuat dua kali, anggota di-upsert
// berdasarkan NIM, dan password yang sudah diganti anggota TIDAK ditimpa.
// Password awal setiap anggota = NIM-nya (tersimpan sebagai hash bcrypt).
//
// Connection string JANGAN ditulis di file ini. Simpan di file .env (sejajar dengan file ini):
//   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.hhia1d7.mongodb.net/presensi_pintar?retryWrites=true&w=majority
// =====================================================================

try { require('dotenv').config(); } catch (_) { /* dotenv opsional jika MONGODB_URI sudah di-set di terminal */ }
const mongoose = require('mongoose');

const DB_NAME = 'presensi_pintar';

// Data anggota (dari KTA_Pengurus_HIMAFOR_2627.xlsx). "hash" = bcrypt dari NIM.
const anggota = [
  {
    "nama": "Haikal Azkal Azkiya",
    "nim": "2488010038",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Jakarta",
    "tanggalLahir": "2006-05-24",
    "noTelepon": "08989782522",
    "jabatan": "Ketua Umum",
    "departemen": "Steering Committee",
    "email": "haikalazkal06@gmail.com",
    "hash": "$2a$10$RGfeV15lM5.h.it/DJoWp.RRXGX6GFE5cD9R0ceVhxXFdjq5H.kHO"
  },
  {
    "nama": "Muhammad ‘Arif Nur Shidiq",
    "nim": "2488010022",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Cirebon",
    "tanggalLahir": "2005-07-25",
    "noTelepon": "082118113252",
    "jabatan": "Wakil Ketua Umum",
    "departemen": "Steering Committee",
    "email": "arief.shidiq4113@gmail.com",
    "hash": "$2a$10$KDeBC0eHztHVpuwe9y1CBeq1Yt4zQtW.PCi1gECOv7UESCa7mqyNO"
  },
  {
    "nama": "Tiara Salsabila",
    "nim": "2488010045",
    "jenisKelamin": "Perempuan",
    "tempatLahir": "Cirebon",
    "tanggalLahir": "2006-03-17",
    "noTelepon": "08888225949",
    "jabatan": "Sekretaris Umum I",
    "departemen": "Steering Committee",
    "email": "tyrsalsabila@gmail.com",
    "hash": "$2a$10$yuZzxawxdkoEvhk8PmxSRO8moxqfAR8TUSk1E5.udLC9zQ0DK6C4W"
  },
  {
    "nama": "Wafah Khonia",
    "nim": "2530801081",
    "jenisKelamin": "Perempuan",
    "tempatLahir": "Indramayu",
    "tanggalLahir": "2007-05-04",
    "noTelepon": "083192851972",
    "jabatan": "Sekretaris Umum II",
    "departemen": "Steering Committee",
    "email": "wafahkhonia3@gmail.com",
    "hash": "$2a$10$i1OJrWzUKL/XtBDE0aVzUuAgUzx8pDrjd4OYVTb69PG.neZiFMoli"
  },
  {
    "nama": "Rifa’ah Fatihatu Sa’adah",
    "nim": "2488010008",
    "jenisKelamin": "Perempuan",
    "tempatLahir": "Majalengka",
    "tanggalLahir": "2006-07-05",
    "noTelepon": "082118134193",
    "jabatan": "Bendahara Umum I",
    "departemen": "Steering Committee",
    "email": "rifasaa05@gmail.com",
    "hash": "$2a$10$qWbqXoO9ud1oWRB4EQdeFeHUfYxe6rvnPLEz.OvQsZdIXk.BoWRLy"
  },
  {
    "nama": "Azhalia Mozaik",
    "nim": "2530801059",
    "jenisKelamin": "Perempuan",
    "tempatLahir": "Majalengka",
    "tanggalLahir": "2007-05-12",
    "noTelepon": "089630530306",
    "jabatan": "Bendahara Umum II",
    "departemen": "Steering Committee",
    "email": "mozaikazhalia@gmail.com",
    "hash": "$2a$10$e5WaVzJxj6W8YMxnNkOspub4AHyQLz2IQG3xvLoQw2Pz.qCVX.aJy"
  },
  {
    "nama": "Nisa Naila",
    "nim": "2488010024",
    "jenisKelamin": "Perempuan",
    "tempatLahir": "Majalengka",
    "tanggalLahir": "2005-10-08",
    "noTelepon": "085659325240",
    "jabatan": "Kepala Departemen",
    "departemen": "Department of Strategic Advocacy (DSA)",
    "kodeDepartemen": "DSA",
    "email": "nisanailapr123@gmail.com",
    "hash": "$2a$10$lj3dsXCpTbSeKRIu/TCYZugUNVV1Sddn/f2akj.lJeHHah2Gg1/0O"
  },
  {
    "nama": "Nayla Sabryna",
    "nim": "2530801022",
    "jenisKelamin": "Perempuan",
    "tempatLahir": "Indramayu",
    "tanggalLahir": "2005-05-12",
    "noTelepon": "087712809656",
    "jabatan": "Sekretaris Departemen",
    "departemen": "Department of Strategic Advocacy (DSA)",
    "kodeDepartemen": "DSA",
    "email": "geanandasabryna@gmail.com",
    "hash": "$2a$10$Vfn163kWmQL7fImT7izsX.ZypOQKythfOPaHEry4Pa.cvar19WZLC"
  },
  {
    "nama": "Ananda Rizqi Kurniawan",
    "nim": "2530801036",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Cirebon",
    "tanggalLahir": "2006-11-01",
    "noTelepon": "08993937479",
    "jabatan": "Bendahara Departemen",
    "departemen": "Department of Strategic Advocacy (DSA)",
    "kodeDepartemen": "DSA",
    "email": "g45413219@gmail.com",
    "hash": "$2a$10$dviA3OKg8jcgFuC4f9Sy3uFvtlWLtNPVA1//rWHrR0iQZZ08dNloG"
  },
  {
    "nama": "Diandra Enka Nugraha",
    "nim": "2530801104",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Subang",
    "tanggalLahir": "2006-12-03",
    "noTelepon": "085881314116",
    "jabatan": "Anggota Departemen",
    "departemen": "Department of Strategic Advocacy (DSA)",
    "kodeDepartemen": "DSA",
    "email": "diandraenkanugraha@gmail.com",
    "hash": "$2a$10$S/XqPOivSLwua9y4eA/Nl.uaAQG4Bn2CdRaFWaNwq.980hlcpOi0O"
  },
  {
    "nama": "Maulana Azidan Ghoni",
    "nim": "2530801011",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Bekasi",
    "tanggalLahir": "2007-09-14",
    "noTelepon": "087784007454",
    "jabatan": "Anggota Departemen",
    "departemen": "Department of Strategic Advocacy (DSA)",
    "kodeDepartemen": "DSA",
    "email": "azidanghoni14@gmail.com",
    "hash": "$2a$10$hBky3gDC4Bhr7I8oBbL7E.XivGm7jee.uAfZ6Qc0ZXZsaT5216He6"
  },
  {
    "nama": "Taohid",
    "nim": "2530801047",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Brebes",
    "tanggalLahir": "2007-05-23",
    "noTelepon": "083117417650",
    "jabatan": "Anggota Departemen",
    "departemen": "Department of Strategic Advocacy (DSA)",
    "kodeDepartemen": "DSA",
    "email": "taohidd123@gmail.com",
    "hash": "$2a$10$obDjKvPrp05opDcj/pdhLO7vBRLfT2azaphUQ/bMiDvAZ9g2rsjmS"
  },
  {
    "nama": "Nayla Rahma Farhanah",
    "nim": "2488010026",
    "jenisKelamin": "Perempuan",
    "tempatLahir": "Indramayu",
    "tanggalLahir": "2005-06-29",
    "noTelepon": "082125385275",
    "jabatan": "Kepala Departemen",
    "departemen": "Department of Leadership Development and Engagement (LEADE)",
    "kodeDepartemen": "LEADE",
    "email": "naylanara89@gmail.com",
    "hash": "$2a$10$LY9CSFd9H8qGxrw7EQ.kruWz.wnIjMqBC7AgNRqDYlJ4Mt07CAUfq"
  },
  {
    "nama": "Masdika Pahlepi Iskandar",
    "nim": "2530801014",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Oku Timur",
    "tanggalLahir": "2007-10-12",
    "noTelepon": "085134947481",
    "jabatan": "Sekretaris Departemen",
    "departemen": "Department of Leadership Development and Engagement (LEADE)",
    "kodeDepartemen": "LEADE",
    "email": "masdikapahlepii51@gmail.com",
    "hash": "$2a$10$HP4MDu.jD2TzjNzIIl3IYOcE6/r2mXe5/SNauB7oGwqkBakp44rW."
  },
  {
    "nama": "Fitria Eka Rachmadani",
    "nim": "2530801006",
    "jenisKelamin": "Perempuan",
    "tempatLahir": "Cirebon",
    "tanggalLahir": "2007-09-23",
    "noTelepon": "082130482673",
    "jabatan": "Bendahara Departemen",
    "departemen": "Department of Leadership Development and Engagement (LEADE)",
    "kodeDepartemen": "LEADE",
    "email": "fitriarachmadani2309@gmail.com",
    "hash": "$2a$10$I8XD8zEZaV3ZSmSh9cUtPOkMWJxouKyqVRUDEyQO9/sPrM19TZuD."
  },
  {
    "nama": "Ananda Rasya Moppang Doli Harahap",
    "nim": "2530801072",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Jakarta",
    "tanggalLahir": "2006-09-18",
    "noTelepon": "085161117734",
    "jabatan": "Anggota Departemen",
    "departemen": "Department of Leadership Development and Engagement (LEADE)",
    "kodeDepartemen": "LEADE",
    "email": "anandarasya325@gmail.com",
    "hash": "$2a$10$STA8uUNgURZqPALTIzaubOZjrtkqCZS1t19Nt0lr4vtDYscDw.ACq"
  },
  {
    "nama": "Ghiyas Muharraran",
    "nim": "2530801007",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Pematangsiantar",
    "tanggalLahir": "2007-12-21",
    "noTelepon": "0895628680899",
    "jabatan": "Anggota Departemen",
    "departemen": "Department of Leadership Development and Engagement (LEADE)",
    "kodeDepartemen": "LEADE",
    "email": "muharraranghiyas@gmail.com",
    "hash": "$2a$10$yleo1G2h9obgMgCPCibeO.sdMZPudtB3arCU.wZH8yaoYGyTEUoEC"
  },
  {
    "nama": "Ahmad Fadilah Syah",
    "nim": "2488010029",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Cirebon",
    "tanggalLahir": "2005-09-27",
    "noTelepon": "085871435748",
    "jabatan": "Anggota Departemen",
    "departemen": "Department of Leadership Development and Engagement (LEADE)",
    "kodeDepartemen": "LEADE",
    "hash": "$2a$10$dIRvqOQAKBNyEx5/T3Q.wufMpulFJTnF9O19znLkYq1MJS4s2p.ga"
  },
  {
    "nama": "Abdullah Assegaf",
    "nim": "2488010076",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Cirebon",
    "tanggalLahir": "2004-09-27",
    "noTelepon": "087716775287",
    "jabatan": "Kepala Departemen",
    "departemen": "Department of Moral and Public Relations (DMPR)",
    "kodeDepartemen": "DMPR",
    "email": "dolahsgf1@gmail.com",
    "hash": "$2a$10$5q2qK6qmraXxXxDNVGWM8.8ou56hHu2tpV2SdP07fIu5Et6sAV7/m"
  },
  {
    "nama": "Nazwa Nabila",
    "nim": "2530801088",
    "jenisKelamin": "Perempuan",
    "tempatLahir": "Cirebon",
    "tanggalLahir": "2007-01-18",
    "noTelepon": "08812064830",
    "jabatan": "Sekretaris Departemen",
    "departemen": "Department of Moral and Public Relations (DMPR)",
    "kodeDepartemen": "DMPR",
    "email": "nazwanabillaa18@gmail.com",
    "hash": "$2a$10$p4IYs20qGmeUh4HCkDNVk.HhMhgJGziVJIp9lSBv6HYe53B4VHLwi"
  },
  {
    "nama": "Rizky Fadilah",
    "nim": "2488010040",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Kuningan",
    "tanggalLahir": "2006-02-18",
    "noTelepon": "083116544267",
    "jabatan": "Bendahara Departemen",
    "departemen": "Department of Moral and Public Relations (DMPR)",
    "kodeDepartemen": "DMPR",
    "email": "fadilrizky810@gmail.com",
    "hash": "$2a$10$gmIPvcWZrm8.LbAe4aCjq.ySXZa3zx2GX8w5InKcCi4WXgaqOgmj6"
  },
  {
    "nama": "Abil Ghinaya Azka",
    "nim": "2530801056",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Tegal",
    "tanggalLahir": "2007-08-13",
    "noTelepon": "0895700230123",
    "jabatan": "Anggota Departemen",
    "departemen": "Department of Moral and Public Relations (DMPR)",
    "kodeDepartemen": "DMPR",
    "email": "ghinayaabil13@gmail.com",
    "hash": "$2a$10$iF9V1v.BYe0Mqb4wcdxXxepFBvcXUi7Y5XLuB8wVoXs0fw1Jn.LYW"
  },
  {
    "nama": "Kalin Aulia Haifa",
    "nim": "2530801068",
    "jenisKelamin": "Perempuan",
    "tempatLahir": "Cirebon",
    "tanggalLahir": "2006-07-20",
    "noTelepon": "081312733682",
    "jabatan": "Anggota Departemen",
    "departemen": "Department of Moral and Public Relations (DMPR)",
    "kodeDepartemen": "DMPR",
    "email": "kalinaulia204@gmail.com",
    "hash": "$2a$10$QNS5cNqVFQvvRE3DgkH6EegMMxX0rJlBSF2xwD9WUjEJhDPRdKNnq"
  },
  {
    "nama": "Muhammad Majid Baihaqi",
    "nim": "2530801092",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Cirebon",
    "tanggalLahir": "2006-12-17",
    "noTelepon": "083895375235",
    "jabatan": "Anggota Departemen",
    "departemen": "Department of Moral and Public Relations (DMPR)",
    "kodeDepartemen": "DMPR",
    "email": "majidbaihaqi24@gmail.com",
    "hash": "$2a$10$wTHDTLCtQLMfqAyprBjofeJeo80PeyrEdyws5kLJFyZemkinQyslO"
  },
  {
    "nama": "Irfan Mubarok",
    "nim": "2488010075",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Cirebon",
    "tanggalLahir": "2006-02-17",
    "noTelepon": "083804339441",
    "jabatan": "Kepala Departemen",
    "departemen": "Department of Information and Communications (DIC)",
    "kodeDepartemen": "DIC",
    "email": "irfanmubarok@mail.uinssc.ac.id",
    "hash": "$2a$10$x/5HT1cuG9ZeZfk3HAFC0O0vXkIAel8xaF/oayUXWet7jAlMIaT/2"
  },
  {
    "nama": "Ahmad Ali Murtadlo",
    "nim": "2488010056",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Cirebon",
    "tanggalLahir": "2006-02-11",
    "noTelepon": "081572335164",
    "jabatan": "Sekretaris Departemen",
    "departemen": "Department of Information and Communications (DIC)",
    "kodeDepartemen": "DIC",
    "hash": "$2a$10$WecS88vAH24kGSNU9mm/LOUyFzvbRD55fHRWrmgM83rGdIfwVrVs."
  },
  {
    "nama": "Lailatul Qodariah",
    "nim": "2488010006",
    "jenisKelamin": "Perempuan",
    "tempatLahir": "Cirebon",
    "tanggalLahir": "2006-10-02",
    "noTelepon": "083852406452",
    "jabatan": "Bendahara Departemen",
    "departemen": "Department of Information and Communications (DIC)",
    "kodeDepartemen": "DIC",
    "email": "lailatulqodariah021@gmail.com",
    "hash": "$2a$10$pxiZ4H8L8zWSu5afbU.j7OEVwlZbda2MUBXfWDURdXCP26ZE0eMR."
  },
  {
    "nama": "Pasya Nur Rizki",
    "nim": "2488010052",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Cirebon",
    "tanggalLahir": "2006-03-11",
    "noTelepon": "081572076865",
    "jabatan": "Anggota Departemen",
    "departemen": "Department of Information and Communications (DIC)",
    "kodeDepartemen": "DIC",
    "email": "pasyarizki@mail.uinssc.ac.id",
    "hash": "$2a$10$3ToxLVZNIJTY1r6z3mVQuejP4ob3neUVPGRhnZvdLlTmNfRFYUYZG"
  },
  {
    "nama": "Ahmad Da'il Mukarrom",
    "nim": "2530801015",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Pandeglang",
    "tanggalLahir": "2007-05-25",
    "noTelepon": "083890248073",
    "jabatan": "Anggota Departemen",
    "departemen": "Department of Information and Communications (DIC)",
    "kodeDepartemen": "DIC",
    "email": "ahmad.dail.mukarrom@mail.uinssc.ac.id",
    "hash": "$2a$10$uMDeM2gJNWo842zBQwxQCuP3JFLO7gs3SXKdfaIY0YHK3obX8V.6y"
  },
  {
    "nama": "Akbar Fabiansyah",
    "nim": "2530801016",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Cilegon",
    "tanggalLahir": "2007-03-02",
    "noTelepon": "089603431805",
    "jabatan": "Anggota Departemen",
    "departemen": "Department of Information and Communications (DIC)",
    "kodeDepartemen": "DIC",
    "hash": "$2a$10$mj6A3Ndp8GgOkDgoKryp1uHip/LbSM.hSoy.GXRnd70N6wAVrU0z6"
  },
  {
    "nama": "Nizar Aftana Nursya'ban",
    "nim": "2530801097",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Subang",
    "tanggalLahir": "2007-08-29",
    "noTelepon": "0881022416234",
    "jabatan": "Anggota Departemen",
    "departemen": "Department of Information and Communications (DIC)",
    "kodeDepartemen": "DIC",
    "email": "nizaraftana07@gmail.com",
    "hash": "$2a$10$nJRUSHSGUui8UZshQHcD9.MdaCNzjJ9mWnLY8eWyHVwPyztDMExIq"
  },
  {
    "nama": "Dawwas Zakka Sutiono",
    "nim": "2488010015",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Purwakarta",
    "tanggalLahir": "2006-08-12",
    "noTelepon": "085926116208",
    "jabatan": "Kepala Departemen",
    "departemen": "Department of Educational Science and Technology (EDUTECH)",
    "kodeDepartemen": "EDUTECH",
    "email": "dawwaszakka@gmail.com",
    "hash": "$2a$10$Gtdc8nnloxk2UAeW7VffJOKHi6FJRO9El08vY8E0oBf6oOr1qDTSa"
  },
  {
    "nama": "Shafira Azzahra Riadi",
    "nim": "2530801043",
    "jenisKelamin": "Perempuan",
    "tempatLahir": "Cirebon",
    "tanggalLahir": "2007-06-17",
    "noTelepon": "085221227785",
    "jabatan": "Sekretaris Departemen",
    "departemen": "Department of Educational Science and Technology (EDUTECH)",
    "kodeDepartemen": "EDUTECH",
    "email": "azzahrashafira716@gmail.com",
    "hash": "$2a$10$Tvys/Ijbdyj2UTti6DF5cOjfnu8..QQAlTaM9kVXeGTFwIoif.Bh6"
  },
  {
    "nama": "Much. Mentari Irwansyah",
    "nim": "2530801035",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Cirebon",
    "tanggalLahir": "2006-11-20",
    "noTelepon": "0882001032640",
    "jabatan": "Bendahara Departemen",
    "departemen": "Department of Educational Science and Technology (EDUTECH)",
    "kodeDepartemen": "EDUTECH",
    "email": "irwangg20@gmail.com",
    "hash": "$2a$10$VwbjT4xepUAJccrchhy4lefd1XTvrWGhpquBvzPlKxOdo0W7Kht.u"
  },
  {
    "nama": "Tanu Hasyim",
    "nim": "2488010011",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Tangerang",
    "tanggalLahir": "2006-05-10",
    "noTelepon": "082231044662",
    "jabatan": "Anggota Departemen",
    "departemen": "Department of Educational Science and Technology (EDUTECH)",
    "kodeDepartemen": "EDUTECH",
    "email": "tunahisyam@gmail.com",
    "hash": "$2a$10$QxhrtOP.JeG2pdepA1tFgOnaatkbnj8hdOYnXGK00BK4K9VAkrlbe"
  },
  {
    "nama": "Muhammad David Rizal Fahrezi",
    "nim": "2530801050",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Rembang",
    "tanggalLahir": "2007-05-10",
    "noTelepon": "08579881243",
    "jabatan": "Anggota Departemen",
    "departemen": "Department of Educational Science and Technology (EDUTECH)",
    "kodeDepartemen": "EDUTECH",
    "email": "muhammaddavid1057@gmail.com",
    "hash": "$2a$10$uDoEZeqSCxpxxrKJxcIvSeFou66DPvBznNqJn.9Pfa6bdQZxeXcSS"
  },
  {
    "nama": "Ahmad Syarifudin",
    "nim": "2530801032",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Grobogan",
    "tanggalLahir": "2006-12-28",
    "noTelepon": "08986020028",
    "jabatan": "Anggota Departemen",
    "departemen": "Department of Educational Science and Technology (EDUTECH)",
    "kodeDepartemen": "EDUTECH",
    "email": "ahmadsyarifudin281226@gmail.com",
    "hash": "$2a$10$UJBwemHHxkNc1Zr5jzwUcOG2P7vF3qQ0CjU/DBK91g60FzG8XIPMK"
  },
  {
    "nama": "Putra Rais Hakim",
    "nim": "2530801085",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Cirebon",
    "tanggalLahir": "2006-12-19",
    "noTelepon": "0895328114260",
    "jabatan": "Anggota Departemen",
    "departemen": "Department of Educational Science and Technology (EDUTECH)",
    "kodeDepartemen": "EDUTECH",
    "email": "raishakim847@gmail.com",
    "hash": "$2a$10$V0EknXAT7SJzWwJ/9n9BpuqEhpnJNwBlfzbwi/xs2Yayp9RFHwS7u"
  },
  {
    "nama": "Ashfahani Hasyim",
    "nim": "2488010070",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Cirebon",
    "tanggalLahir": "2005-07-24",
    "noTelepon": "085798004301",
    "jabatan": "Kepala Departemen",
    "departemen": "Department of Talent and Interests (DOTS)",
    "kodeDepartemen": "DOTS",
    "email": "ashfahani77@gmail.com",
    "hash": "$2a$10$5NNd/6XX3Uc5IttVVzYYa.J4SZ3CC9Iy1yphJIA8fDLROMAHCraYS"
  },
  {
    "nama": "Taufik Arrokhman",
    "nim": "2530801002",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Pelalawan",
    "tanggalLahir": "2006-12-02",
    "noTelepon": "082333838438",
    "jabatan": "Sekretaris Departemen",
    "departemen": "Department of Talent and Interests (DOTS)",
    "kodeDepartemen": "DOTS",
    "email": "taoefik.arrokhman@gmail.com",
    "hash": "$2a$10$93EXEWKODdJnlj.s5iOlGessSjEBh4VDqsB.2xIVJXn3t/Uq3zFvy"
  },
  {
    "nama": "Bintang Mutiara 'Arsy",
    "nim": "2530801082",
    "jenisKelamin": "Perempuan",
    "tempatLahir": "Cirebon",
    "tanggalLahir": "2007-05-24",
    "noTelepon": "081224494938",
    "jabatan": "Bendahara Departemen",
    "departemen": "Department of Talent and Interests (DOTS)",
    "kodeDepartemen": "DOTS",
    "email": "bintangmutiaraarsyy@gmail.com",
    "hash": "$2a$10$CmK7KCJXzAG3j0JC1G69eexyUrXqsa1hjy/0dxzQMTjpM8x8EqPuS"
  },
  {
    "nama": "Al Farid Maulani",
    "nim": "2530801025",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Cirebon",
    "tanggalLahir": "2005-02-17",
    "noTelepon": "081224383705",
    "jabatan": "Anggota Departemen",
    "departemen": "Department of Talent and Interests (DOTS)",
    "kodeDepartemen": "DOTS",
    "email": "alfaridmaulani4@gmail.com",
    "hash": "$2a$10$T2Rdz2WDKYAIdz.n6FR9DOOo0gamHKYByotkdmnRSZGD3rN2MCuvq"
  },
  {
    "nama": "Fadhila Itmamul Fiqri",
    "nim": "2530801083",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Banjar",
    "tanggalLahir": "2007-05-29",
    "noTelepon": "085872316765",
    "jabatan": "Anggota Departemen",
    "departemen": "Department of Talent and Interests (DOTS)",
    "kodeDepartemen": "DOTS",
    "email": "fadilofficial290507@gmail.com",
    "hash": "$2a$10$tso1IMk.T7.t4EsEMktVgO6tkEUQEx3F3AaeBS42TImS.JF0lKOGG"
  },
  {
    "nama": "Muhammad Ismail Aulia",
    "nim": "2530801052",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Tangerang",
    "tanggalLahir": "2007-01-16",
    "noTelepon": "081299936513",
    "jabatan": "Anggota Departemen",
    "departemen": "Department of Talent and Interests (DOTS)",
    "kodeDepartemen": "DOTS",
    "email": "ismailaulia89@gmail.com",
    "hash": "$2a$10$zsymNMRr8zZDnlpxDSk8v.rprkVevENFAR8zq5Ktb2S32FQeBZ.dS"
  },
  {
    "nama": "Moh. Farid Ilham Ghifari",
    "nim": "2488010066",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Subang",
    "tanggalLahir": "2006-02-03",
    "noTelepon": "083156623352",
    "jabatan": "Kepala Departemen",
    "departemen": "Department of Creative Economy (DCE)",
    "kodeDepartemen": "DCE",
    "email": "faridilham0302@gmail.com",
    "hash": "$2a$10$9OsozLsLdHpJgE/JJegzruDcvarkHqYDdPvK7MtRbCy7Qf/kv1QS6"
  },
  {
    "nama": "Lutfiyah",
    "nim": "2530801060",
    "jenisKelamin": "Perempuan",
    "tempatLahir": "Cirebon",
    "tanggalLahir": "2008-08-17",
    "noTelepon": "082246927882",
    "jabatan": "Sekretaris Departemen",
    "departemen": "Department of Creative Economy (DCE)",
    "kodeDepartemen": "DCE",
    "email": "lululutfiyah1708@gmail.com",
    "hash": "$2a$10$dEdEHtnQe7FBFs8NszSTK.0N9wEiv.55p2oCF3W45Wbtg.Qpk5YPS"
  },
  {
    "nama": "Yohanes David",
    "nim": "2530801100",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Cirebon",
    "tanggalLahir": "2007-03-09",
    "noTelepon": "0895428570104",
    "jabatan": "Bendahara Departemen",
    "departemen": "Department of Creative Economy (DCE)",
    "kodeDepartemen": "DCE",
    "email": "yohanesdavid039@gmail.com",
    "hash": "$2a$10$MN.WCqSVy6W1E/RDt4M/Nu.amTeqXVU8KrmHE9T8.nmTZdmcwN8O."
  },
  {
    "nama": "Avis Budiman Tauladani",
    "nim": "2488010002",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Cirebon",
    "tanggalLahir": "2005-11-23",
    "noTelepon": "0882001597176",
    "jabatan": "Anggota Departemen",
    "departemen": "Department of Creative Economy (DCE)",
    "kodeDepartemen": "DCE",
    "email": "avisbudiman@gmail.com",
    "hash": "$2a$10$G6MMPE65TN2Vs4yeXTXWk./dd/ob33B.S5ZiRvHaUDG5O3S4FtAx2"
  },
  {
    "nama": "Agung Dwi Jaya",
    "nim": "2530801093",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Cirebon",
    "tanggalLahir": "2007-12-17",
    "noTelepon": "085757503369",
    "jabatan": "Anggota Departemen",
    "departemen": "Department of Creative Economy (DCE)",
    "kodeDepartemen": "DCE",
    "email": "agungdwijaya1712@gmail.com",
    "hash": "$2a$10$.Jk5sN7me.fkFVquSHQcoeqetEJMP5PhaDUuOu/Le.ywPp3kQtIJG"
  },
  {
    "nama": "Farras Fairuzabadi Kurozy",
    "nim": "2530801027",
    "jenisKelamin": "Laki-laki",
    "tempatLahir": "Tangerang",
    "tanggalLahir": "2006-09-08",
    "noTelepon": "081295602828",
    "jabatan": "Anggota Departemen",
    "departemen": "Department of Creative Economy (DCE)",
    "kodeDepartemen": "DCE",
    "email": "farrasfairuz08@gmail.com",
    "hash": "$2a$10$nWAER4bqs59ZecR0oFmbDeLPBc13Pa1bA3Er/rogoY00yPxEPWx7y"
  }
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI belum diisi. Buat file .env, lihat komentar di bagian atas file ini.');

  await mongoose.connect(uri, { dbName: DB_NAME, serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;
  console.log('Database terhubung: ' + db.databaseName);

  // ---------- 1. Collection ----------
  const koleksi = ['members', 'facetemplates', 'activities', 'attendancesessions',
                   'attendancerecords', 'attendanceattempts', 'auditlogs'];
  const ada = (await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name);
  for (const c of koleksi) if (!ada.includes(c)) await db.createCollection(c);

  // ---------- 2. Index ----------
  await db.collection('members').createIndex({ nim: 1 }, { unique: true });
  await db.collection('members').createIndex({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: 'string' } } });
  await db.collection('members').createIndex({ departemen: 1, jabatan: 1 });

  await db.collection('facetemplates').createIndex({ memberId: 1 }, { unique: true, partialFilterExpression: { aktif: true } });
  await db.collection('activities').createIndex({ tanggal: 1 });
  await db.collection('attendancesessions').createIndex({ activityId: 1 });
  await db.collection('attendancesessions').createIndex({ status: 1 });
  await db.collection('attendancerecords').createIndex({ sessionId: 1, memberId: 1 }, { unique: true });
  await db.collection('attendancerecords').createIndex({ memberId: 1, waktu: -1 });
  await db.collection('attendanceattempts').createIndex({ waktu: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 }); // hapus otomatis setelah 90 hari
  await db.collection('attendanceattempts').createIndex({ sessionId: 1, memberId: 1 });
  await db.collection('auditlogs').createIndex({ waktu: -1 });
  console.log('Collection dan index siap');

  // ---------- 3. Data anggota ----------
  const sekarang = new Date();
  const ops = anggota.map(({ hash, tanggalLahir, ...data }) => ({
    updateOne: {
      filter: { nim: data.nim },
      update: {
        $set: { ...data, tanggalLahir: new Date(tanggalLahir), updatedAt: sekarang },
        $setOnInsert: { passwordHash: hash, mustChangePassword: true, aktif: true, createdAt: sekarang },
      },
      upsert: true,
    },
  }));

  const hasil = await db.collection('members').bulkWrite(ops);
  console.log('Anggota baru: ' + hasil.upsertedCount + ', diperbarui: ' + hasil.modifiedCount);
  console.log('Total anggota di database: ' + (await db.collection('members').countDocuments()));
  console.log('Jumlah akses admin (Ketua/Wakil/Sekum): ' +
    (await db.collection('members').countDocuments({
      jabatan: { $in: ['Ketua Umum', 'Wakil Ketua Umum', 'Sekretaris Umum I', 'Sekretaris Umum II'] },
    })));
}

main()
  .catch((err) => { console.error('Gagal:', err.message); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());