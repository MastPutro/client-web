# API Register User - Setup Guide

## 📋 Overview
Sistem API untuk register user dengan keamanan berbasis API Key. Hanya aplikasi yang terdaftar dan memiliki API Key valid yang dapat menggunakan endpoint ini.

## 🔧 Setup Steps

### Step 1: Run Migration
Jalankan migration untuk membuat tabel `client_applications`:
```bash
php artisan migrate
```

### Step 2: Seed Client Applications (Opsional)
Jika ingin menggunakan data testing yang sudah disiapkan:
```bash
php artisan db:seed --class=ClientApplicationSeeder
```

Ini akan membuat 3 aplikasi testing:
- **Mobile App** - dengan API key yang akan di-generate
- **Web App** - dengan API key yang akan di-generate
- **Testing Client** - dengan API key: `test-api-key-12345`

### Step 3: Generate API Key untuk Aplikasi Anda
Untuk aplikasi yang ingin mengakses API register:
```bash
php artisan app:generate-api-key "Nama Aplikasi Anda" --description="Deskripsi aplikasi"
```

**Contoh:**
```bash
php artisan app:generate-api-key "Mobile App" \
  --description="Aplikasi mobile untuk registrasi user"
```

Output akan menampilkan API Key yang harus disimpan dengan aman:
```
✓ Aplikasi berhasil terdaftar!

API Key:
550e8400-e29b-41d4-a716-446655440000

Instruksi:
1. Simpan API Key dengan aman
2. Kirim API Key di header request: X-API-Key: 550e8400-e29b-41d4-a716-446655440000
```

## 📁 File Structure
Berikut adalah file-file yang telah dibuat:

```
app/
├── Http/
│   └── Middleware/
│       └── VerifyClientApplication.php      # Middleware untuk validasi API Key
├── Models/
│   └── ClientApplication.php                # Model untuk client applications
└── Console/
    └── Commands/
        ├── GenerateApiKey.php               # Command untuk generate API Key
        ├── ListApiKeys.php                  # Command untuk list semua API Key
        └── RevokeApiKey.php                 # Command untuk revoke API Key

database/
├── migrations/
│   └── 2026_03_11_120000_create_client_applications_table.php
└── seeders/
    └── ClientApplicationSeeder.php

routes/
└── api.php                                  # Updated dengan middleware

bootstrap/
└── app.php                                  # Updated dengan middleware alias

tests/
└── Feature/
    └── Auth/
        └── RegisterUserApiTest.php          # Unit tests untuk API

API_REGISTER_DOCUMENTATION.md               # API Documentation lengkap
```

## 🔐 Keamanan
- ✅ Validasi API Key di setiap request
- ✅ Verifikasi status aplikasi (active/revoked)
- ✅ Logging akses dengan timestamp
- ✅ Password hashing dengan bcrypt
- ✅ Email uniqueness validation
- ✅ Middleware yang dapat di-customize

## 🎯 Menggunakan API

### Header yang Diperlukan
```
X-API-Key: YOUR_API_KEY_HERE
Content-Type: application/json
```

### Endpoint
```
POST /api/register-user
```

### Request Body
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password@123",
    "password_confirmation": "Password@123"
}
```

### Response (Sukses)
```json
{
    "message": "User registered successfully",
    "user": {
        "id": 2,
        "name": "John Doe",
        "email": "john@example.com",
        "created_at": "2026-03-11T12:30:45.000000Z",
        "updated_at": "2026-03-11T12:30:45.000000Z"
    }
}
```

## 📊 Artisan Commands

### Generate API Key
```bash
php artisan app:generate-api-key "Nama Aplikasi" --description="Deskripsi"
```

### List Semua API Keys
```bash
php artisan app:list-api-keys
```

Output:
```
+----+----------+--------------------------------------+--------+----------+------------------+
| ID | Nama     | API Key                              | Status | Last Used| Created At       |
+----+----------+--------------------------------------+--------+----------+------------------+
| 1  | Mobile   | 550e8400-e29b-41d4-a716-446655440000| Active | Never    | 2026-03-11 12:00 |
| 2  | Web App  | 660e8400-e29b-41d4-a716-446655440000| Active | 2h ago   | 2026-03-11 12:05 |
+----+----------+--------------------------------------+--------+----------+------------------+
```

### Revoke API Key
```bash
php artisan app:revoke-api-key "Mobile App"
# atau
php artisan app:revoke-api-key "550e8400-e29b-41d4-a716-446655440000"
```

## 🧪 Testing
Jalankan test untuk memastikan API berfungsi dengan benar:
```bash
php artisan test tests/Feature/Auth/RegisterUserApiTest.php
```

## 📝 Testing dengan cURL
```bash
curl -X POST http://localhost:8000/api/register-user \
  -H "X-API-Key: test-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password@123",
    "password_confirmation": "Password@123"
  }'
```

## 🚀 Production Checklist
- [ ] Generate API Key unik untuk setiap aplikasi
- [ ] Simpan API Key di environment variables (.env)
- [ ] Enable HTTPS/SSL
- [ ] Implement rate limiting
- [ ] Setup logging & monitoring
- [ ] Backup database regularly
- [ ] Rotate API Key secara berkala
- [ ] Test dengan actual client applications

## 📚 Dokumentasi Lengkap
Lihat file `API_REGISTER_DOCUMENTATION.md` untuk dokumentasi API yang lengkap termasuk:
- Semua parameter request
- Response errors
- Code examples (cURL, JavaScript, Python)
- Best practices
- Password requirements

## ❓ Troubleshooting

### Error: "API Key is required"
**Solusi:** Pastikan API Key sudah dikirim di header `X-API-Key`

### Error: "Invalid or inactive API Key"
**Solusi:** 
- Periksa API Key sudah benar
- Pastikan aplikasi belum di-revoke dengan `php artisan app:list-api-keys`

### Error: "The email has already been taken"
**Solusi:** Email sudah terdaftar, gunakan email yang berbeda

## 📞 Support
Untuk pertanyaan atau issue, silakan hubungi development team.
