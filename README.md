Aplikasi  Tenant Directory + Unit untuk mall: mengelola data tenant dan menempatkannya ke unit toko. Tidak ada login dan tidak ada role, hanya satu pengguna.

Tech Stack

Backend menggunakan Flask membutuhkan Python version 3.10 keatas
Frontend menggunakan React 19 dengan versi React Router membutuhkan Node version 22
Database menggunakan MySQL version 8

Panduan Instalasi

1. Persiapan Database MySQL
  CREATE DATABASE IF NOT EXISTS mall_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  (catatan: anda tidak perlu membuat tabel manual karena Flask SQLAlchemy akan otomatis membuat skema tabel dan mengisi data seed awal saat backend pertama kali dijalankan).

2. Menjalankan Backend (Flask)
   cd Backend
   pip install -r requirements.txt
   
   Konfigurasi Environtment Database(.env)
   copy .env.example .env

   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=db_password_anda
   DB_NAME=mall_db
   PORT=5000
   FLASK_DEBUG=True

   Jalankan Server Flask
   python app.py

3. Menjalankan Frontend (React)
   cd  frontend
   npm install
   npm run dev