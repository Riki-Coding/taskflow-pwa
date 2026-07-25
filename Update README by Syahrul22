# TaskFlow Mobile

TaskFlow Mobile adalah aplikasi Manajemen Tugas (Task Management) berbasis *Progressive Web App* (PWA) modern yang dibangun murni menggunakan HTML5, CSS3, dan Vanilla JavaScript (ES6) tanpa campur tangan *framework* apapun.

Aplikasi ini mengedepankan filosofi desain *Mobile-First*, antarmuka *Glassmorphism*, serta pendekatan *Offline-First*. Semua data tersimpan secara aman di dalam *browser* menggunakan IndexedDB, sehingga aplikasi dapat berjalan 100% lancar walau tanpa koneksi internet.

---

## 📑 Daftar Isi
1. [Struktur Folder](#-struktur-folder)
2. [Cara Instalasi & Menjalankan (Lokal)](#-cara-instalasi--menjalankan-lokal)
3. [Cara Menggunakan Aplikasi](#-cara-menggunakan-aplikasi)
4. [Backup & Restore (Export/Import)](#-backup--restore-exportimport)
5. [Cara Update Aplikasi](#-cara-update-aplikasi)
6. [Deployment ke GitHub Pages](#-deployment-ke-github-pages)
7. [FAQ (Pertanyaan Umum)](#-faq)

---

## 📁 Struktur Folder

Struktur utama direktori aplikasi ini dipecah secara modular untuk memudahkan pemeliharaan:

```text
TaskFlow-Mobile/
│
├── index.html        # Entry point aplikasi & Struktur UI
├── manifest.json     # Konfigurasi PWA
├── sw.js             # Service Worker untuk Offline Cache
├── README.md         # Dokumentasi (File ini)
│
├── css/
│   └── style.css     # Styling (Glassmorphism & Responsiveness)
│
├── js/
│   ├── helper.js     # Fungsi utilitas (DOM Selector, Formatter, Generator)
│   ├── db.js         # Inti Engine IndexedDB
│   ├── auth.js       # Logika autentikasi dan Session
│   ├── task.js       # Logika CRUD Tasks
│   ├── activity.js   # Logika pencatatan Log Aktivitas
│   ├── ui.js         # Manipulasi DOM dan Rendering Visual
│   └── app.js        # Controller utama & pendaftaran Event Listeners
│
└── assets/
    └── icons/        # Folder ikon PWA (icon-192.png, icon-512.png)
