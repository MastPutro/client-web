# API Register User Dokumentasi

## Endpoint
```
POST /api/register-user
```

## Authentikasi
Semua request ke endpoint ini **WAJIB** menyertakan API Key di header:
```
X-API-Key: YOUR_API_KEY_HERE
```

## Security Features
- ✓ API Key validation
- ✓ Application status verification
- ✓ Request logging (last_used_at)
- ✓ Revocation capability

## Request Headers
```
X-API-Key: YOUR_API_KEY_HERE
Content-Type: application/json
```

## Request Body
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123!@#",
    "password_confirmation": "password123!@#"
}
```

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Nama lengkap user (max 255 characters) |
| email | string | Yes | Email user yang unik (max 255 characters) |
| password | string | Yes | Password minimal 8 karakter dengan kombinasi uppercase, lowercase, number, dan symbol |
| password_confirmation | string | Yes | Konfirmasi password (harus sama dengan password) |

## Response Success (201)
```json
{
    "message": "User registered successfully",
    "user": {
        "id": 2,
        "name": "John Doe",
        "email": "john@example.com",
        "email_verified_at": null,
        "created_at": "2026-03-11T12:30:45.000000Z",
        "updated_at": "2026-03-11T12:30:45.000000Z"
    }
}
```

## Response Errors

### 401 - Missing API Key
```json
{
    "message": "API Key is required",
    "error": "missing_api_key"
}
```

### 401 - Invalid API Key
```json
{
    "message": "Invalid or inactive API Key",
    "error": "invalid_api_key"
}
```

### 422 - Validation Error
```json
{
    "message": "The selected email is invalid. (and 2 more errors)",
    "errors": {
        "name": [
            "The name field is required."
        ],
        "email": [
            "The email has already been taken.",
            "The email field must be a valid email."
        ],
        "password": [
            "The password confirmation does not match.",
            "The password field must be at least 8 characters."
        ]
    }
}
```

## Password Requirements
- Minimal 8 karakter
- Harus mengandung minimal 1 huruf uppercase (A-Z)
- Harus mengandung minimal 1 huruf lowercase (a-z)
- Harus mengandung minimal 1 angka (0-9)
- Harus mengandung minimal 1 karakter spesial (!@#$%^&*)

## Contoh Request dengan cURL
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

## Contoh Request dengan Axios (JavaScript/TypeScript)
```javascript
import axios from 'axios';

const registerUser = async (userData) => {
  try {
    const response = await axios.post(
      'http://localhost:8000/api/register-user',
      userData,
      {
        headers: {
          'X-API-Key': 'YOUR_API_KEY_HERE',
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error
      console.error('Error:', error.response.data);
    } else {
      // Network error
      console.error('Network error:', error.message);
    }
    throw error;
  }
};

// Usage
registerUser({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'Password@123',
  password_confirmation: 'Password@123',
});
```

## Contoh Request dengan Python (Requests)
```python
import requests

def register_user(user_data):
    headers = {
        'X-API-Key': 'YOUR_API_KEY_HERE',
        'Content-Type': 'application/json',
    }
    
    response = requests.post(
        'http://localhost:8000/api/register-user',
        json=user_data,
        headers=headers
    )
    
    return response.json()

# Usage
user_data = {
    'name': 'John Doe',
    'email': 'john@example.com',
    'password': 'Password@123',
    'password_confirmation': 'Password@123'
}

result = register_user(user_data)
print(result)
```

## Setup Instructions

### 1. Generate Migration & Seed
```bash
# Run migration
php artisan migrate

# Seed client applications
php artisan db:seed --class=ClientApplicationSeeder
```

### 2. Register Aplikasi Baru
```bash
# Generate API Key untuk aplikasi baru
php artisan app:generate-api-key "Mobile App" --description="Aplikasi mobile untuk registrasi user"
```

### 3. Lihat Semua API Keys
```bash
php artisan app:list-api-keys
```

### 4. Revoke API Key
```bash
php artisan app:revoke-api-key "Mobile App"
# atau
php artisan app:revoke-api-key "YOUR_API_KEY_HERE"
```

## Rate Limiting (Optional)
Untuk menambahkan rate limiting, update routes/api.php:

```php
Route::middleware(['api', 'verify.client.application', 'throttle:60,1'])->group(function () {
    Route::post('/register-user', [RegisteredUserController::class, 'apiStore']);
});
```

## Fitur Keamanan yang Sudah Diimplementasi
- ✓ API Key-based authentication
- ✓ Status verification (active/inactive/revoked)
- ✓ Request logging (last_used_at timestamp)
- ✓ Database-level security (indexed columns)
- ✓ Password hashing dengan bcrypt
- ✓ Email uniqueness validation
- ✓ Password confirmation validation

## Best Practices
1. **Simpan API Key dengan aman** - Jangan commit ke repository
2. **Rotate API Key secara berkala** - Generate API Key baru dan revoke yang lama
3. **Monitor penggunaan** - Cek last_used_at untuk deteksi API abuse
4. **Gunakan environment variables** - Simpan API Key di .env file
5. **Enable HTTPS** - Pastikan komunikasi terenkripsi di production
