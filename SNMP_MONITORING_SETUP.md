# MikroTik SNMP Traffic Monitoring System

Dokumentasi lengkap untuk sistem monitoring traffic MikroTik menggunakan SNMP.

## Daftar Isi
1. [Gambaran Umum](#gambaran-umum)
2. [Persyaratan](#persyaratan)
3. [Setup & Konfigurasi](#setup--konfigurasi)
4. [Penggunaan](#penggunaan)
5. [API Endpoints](#api-endpoints)
6. [Komponen React](#komponen-react)
7. [OID Referensi](#oid-referensi)
8. [Troubleshooting](#troubleshooting)

## Gambaran Umum

Sistem ini memungkinkan Anda untuk:
- Mengambil data traffic interface dari MikroTik menggunakan SNMP
- Menampilkan traffic dalam format chart interaktif (Line/Bar)
- Monitoring real-time dengan auto-refresh
- Melihat statistik detail termasuk in/out octets, packets, errors
- Widget quick overview untuk dashboard

### Arsitektur
```
MikroTik (12.20.20.1)
    ↓ (SNMP)
Laravel Backend
    ├── SnmpService (app/Services/SnmpService.php)
    └── TrafficController (app/Http/Controllers/TrafficController.php)
    ↓ (REST API)
React Frontend
    ├── TrafficChart Component
    └── TrafficWidget Component
```

## Persyaratan

### Server Backend
1. **PHP 8.1+** dengan SNMP module terinstall
2. **Laravel 12**
3. **Recharts** (sudah terinstall di package.json)

### Perangkat MikroTik
1. **RouterOS** dengan SNMP service aktif
2. IP: `12.20.20.1` *(dapat diubah)*
3. Community string: `public` *(dapat diubah)*
4. PPPoE Interface: `pppoe-namaUserAuth` *(dapat disesuaikan)*

### Network
- Host Laravel harus dapat akses ke MikroTik via SNMP (port 161/UDP)

## Setup & Konfigurasi

### 1. Verifikasi PHP SNMP Module

bash
php -m | grep snmp


Jika tidak terinstall (khususnya di Docker/WSL):

**Ubuntu/Debian:**
bash
sudo apt-get update
sudo apt-get install php-snmp
sudo systemctl restart php8.1-fpm  # atau sesuai versi PHP


**macOS (Homebrew):**
bash
brew install php@8.2 --with-snmp


### 2. Konfigurasi MikroTik SNMP

1. Akses WebUI atau SSH ke MikroTik
2. Navigate ke: **System → SNMP**
3. Aktifkan SNMP Service
4. Set Community String: `public` (atau nilai custom)
5. Pastikan IP host yang akan akses di-whitelist (jika ada security setting)

**Via Terminal/SSH:**
```
/ip service set snmp disabled=no
/snmp community set numbers=0 name=public
/snmp set trap-community=public enabled=yes
```

### 3. Files yang Sudah Dibuat

- `app/Services/SnmpService.php` - Service untuk handle SNMP queries
- `app/Http/Controllers/TrafficController.php` - API endpoints
- `resources/js/Components/Traffic/TrafficChart.tsx` - Chart component
- `resources/js/Components/Traffic/TrafficWidget.tsx` - Widget component
- `resources/js/types/traffic.ts` - TypeScript types
- `routes/api.php` - API routes (sudah diupdate)
- `resources/js/Pages/Dashboard.tsx` - Dashboard (sudah diupdate dengan chart)

### 4. Clear Cache Laravel (jika perlu)

bash
php artisan cache:clear
php artisan config:cache


### 5. Uji Koneksi SNMP

bash
# List semua interfaces di MikroTik
snmpwalk -v 2c -c public 12.20.20.1 1.3.6.1.2.1.2.2.1.2

# Cek specific interface traffic (in octets)
snmpget -v 2c -c public 12.20.20.1 1.3.6.1.2.1.2.2.1.10.8
# (ubah .8 dengan index interface yang sesuai)


Jika tidak ada output, periksa:
- Firewall blocking port 161
- SNMP service belum aktif di MikroTik
- Community string tidak sesuai
- Interface index salah

## Penggunaan

### 1. Tampilkan Traffic Chart di Dashboard

tsx
import TrafficChart from '@/Components/Traffic/TrafficChart';

<TrafficChart 
    interfaceName="pppoe-namaUserAuth"
    interfaceLabel="PPPoE User Auth Interface"
    samples={10}          // Jumlah data point
    interval={5}          // Interval dalam detik
    autoRefresh={true}    // Auto refresh data
    refreshInterval={30000} // Interval refresh dalam ms
    chartType="line"      // 'line' atau 'bar'
/>


### 2. Tampilkan Quick Widget

tsx
import TrafficWidget from '@/Components/Traffic/TrafficWidget';

<TrafficWidget 
    interfaceName="pppoe-namaUserAuth"
    interfaceLabel="PPPoE User Auth"
    autoRefresh={true}
    refreshInterval={10000}
/>


### 3. Ganti Interface Name

**Default:** `pppoe-namaUserAuth`

Untuk interface lain:

tsx
// Method 1: Langsung ubah nama
<TrafficChart interfaceName="ether1" />

// Method 2: Ambil dari API dulu
const [interfaces, setInterfaces] = useState([]);
useEffect(() => {
    axios.get('/api/traffic/interfaces')
        .then(res => setInterfaces(res.data.data));
}, []);


### 4. Monitor Multiple Interfaces

tsx
{interfaces.map((name: string) => (
    <TrafficWidget 
        key={name}
        interfaceName={name}
        interfaceLabel={name}
    />
))}


## API Endpoints

### 1. Get All Interfaces
```
GET /api/traffic/interfaces
```

**Response:**
json
{
    "success": true,
    "data": {
        "1": "ether1",
        "2": "ether2",
        "8": "pppoe-namaUserAuth"
    },
    "total": 3
}


### 2. Get Current Traffic
```
GET /api/traffic/{interfaceName}
GET /api/traffic/pppoe/{interfaceName}
```

**Example:** `GET /api/traffic/pppoe/pppoe-namaUserAuth`

**Response:**
json
{
    "success": true,
    "data": {
        "interface": "pppoe-namaUserAuth",
        "index": 8,
        "in_octets": 1048576,
        "out_octets": 524288,
        "in_packets": 1200,
        "out_packets": 950,
        "in_errors": 0,
        "out_errors": 0,
        "speed": 1000000000,
        "admin_status": "up",
        "operational_status": "up",
        "in_throughput_mbps": 0,
        "out_throughput_mbps": 0,
        "in_octets_formatted": "1 MB",
        "out_octets_formatted": "512 KB"
    }
}


### 3. Get Traffic History
```
GET /api/traffic/{interfaceName}/history
GET /api/traffic/pppoe/{interfaceName}/history
```

**Query Parameters:**
- `samples` (int, default: 10) - Jumlah data point
- `interval` (int, default: 5) - Interval dalam detik

**Example:** `GET /api/traffic/pppoe/pppoe-namaUserAuth/history?samples=20&interval=5`

**Response:**
json
{
    "success": true,
    "data": [
        {
            "time": "10:30:45",
            "timestamp": 1710332445,
            "sample": 1,
            "in_octets": 1048576,
            "out_octets": 524288,
            "in_octets_mb": 1.0,
            "out_octets_mb": 0.5,
            "in_throughput_mbps": 0.15,
            "out_throughput_mbps": 0.08
        }
    ],
    "interface": "pppoe-namaUserAuth",
    "samples": 1,
    "interval_seconds": 5
}


## Komponen React

### TrafficChart
Component untuk menampilkan chart lengkap dengan multiple visualisasi.

**Props:**
```typescript
interface TrafficChartProps {
    interfaceName: string;        // Required
    interfaceLabel?: string;      // Default: interfaceName
    samples?: number;             // Default: 10, Max: 50
    interval?: number;            // Default: 5 (seconds)
    autoRefresh?: boolean;        // Default: true
    refreshInterval?: number;     // Default: 10000 (ms)
    chartType?: 'line' | 'bar';  // Default: 'line'
}
```

**Features:**
- 2 chart tabs (Throughput + Cumulative Data)
- Stats cards (In/Out rates, totals)
- Real-time auto-refresh support
- Error handling & retry button
- Responsive design (Tailwind CSS)
- Loading states

### TrafficWidget
Compact widget untuk quick overview.

**Props:** 
- Same as TrafficChart
- Default: `samples=5, interval=5, refreshInterval=5000`

**Features:**
- Minimal UI footprint
- Status indicator
- Quick in/out stats
- Auto-refresh support

## OID Referensi

Standar SNMP OID untuk network interfaces:

| OID | Deskripsi | Tipe |
|-----|-----------|------|
| 1.3.6.1.2.1.1.1.0 | System Description | String |
| 1.3.6.1.2.1.2.2.1.1.X | Interface Index | Integer |
| 1.3.6.1.2.1.2.2.1.2.X | Interface Name | String |
| 1.3.6.1.2.1.2.2.1.3.X | Interface Type | Integer |
| 1.3.6.1.2.1.2.2.1.5.X | **Speed** | Integer |
| 1.3.6.1.2.1.2.2.1.7.X | Admin Status (1=up, 2=down) | Integer |
| 1.3.6.1.2.1.2.2.1.8.X | Operational Status | Integer |
| 1.3.6.1.2.1.2.2.1.10.X | **In Octets** (bytes in) | Counter |
| 1.3.6.1.2.1.2.2.1.11.X | In Packets | Counter |
| 1.3.6.1.2.1.2.2.1.13.X | In Errors | Counter |
| 1.3.6.1.2.1.2.2.1.16.X | **Out Octets** (bytes out) | Counter |
| 1.3.6.1.2.1.2.2.1.17.X | Out Packets | Counter |
| 1.3.6.1.2.1.2.2.1.20.X | Out Errors | Counter |

*X = Interface Index (mulai dari 1)*

### Cara Menemukan Interface Index

bash
snmpwalk -v 2c -c public 12.20.20.1 1.3.6.1.2.1.2.2.1.2 | grep pppoe-namaUserAuth


Output:
```
iso.3.6.1.2.1.2.2.1.2.8 = STRING: "pppoe-namaUserAuth"
                          ↑ Index adalah 8
```

## Troubleshooting

### 1. "Failed to retrieve interfaces from SNMP"

**Penyebab:**
- SNMP service MikroTik belum aktif
- Firewall blocking port 161
- IP address tidak sesuai
- Community string salah

**Solusi:**
bash
# Test ping
ping 12.20.20.1

# Test SNMP dengan snmpwalk
snmpwalk -v 2c -c public 12.20.20.1 1.3.6.1.2.1.1.1.0

# Check firewall
sudo ufw status


### 2. "Interface 'pppoe-namaUserAuth' not found"

**Penyebab:**
- Interface name typo
- Interface tidak aktif di MikroTik
- Interface sudah dihapus

**Solusi:**
bash
# Lihat semua interface yang tersedia
snmpwalk -v 2c -c public 12.20.20.1 1.3.6.1.2.1.2.2.1.2


### 3. "Error fetching traffic data" (Frontend)

**Penyebab:**
- CORS issue
- Laravel route tidak terdaftar
- Server error

**Solusi:**
bash
# Check Laravel routes
php artisan route:list | grep traffic

# Check error logs
tail -f storage/logs/laravel.log

# Test API endpoint langsung
curl http://localhost:8000/api/traffic/interfaces


### 4. SNMP Module Belum Terinstall

**Cek instalasi:**
bash
php -i | grep "SNMP Support"


**Install:**
bash
# Ubuntu/Debian
sudo apt-get install php-snmp

# CentOS/RHEL
sudo yum install php-snmp

# Restart web server
sudo systemctl restart apache2  # atau nginx


### 5. Data Chart Kosong/Error

**Debug steps:**
1. Buka browser console (F12)
2. Check network tab → `/api/traffic/...` request
3. Lihat response error
4. Check Laravel logs: `storage/logs/laravel.log`
5. Verify SNMP service aktif: lihat log MikroTik

## Performance Tips

1. **Reduce Refresh Interval** - Gunakan interval lebih panjang untuk reduce load
   tsx
   refreshInterval={60000} // 60 detik

2. **Limit Samples** - Data besar = render lebih lambat
   tsx
   samples={5} // Lebih sedikit tapi lebih responsive

3. **Use SNMP v3** - Lebih secure (implementasi future)

4. **Cache API Response** - Tambah caching di Laravel
   php
   Cache::remember('traffic.'.$interface, 60, function() {
       return $this->snmpService->getInterfaceTraffic($interface);
   });

## Customization

### Ubah Interface Name
Edit `resources/js/Pages/Dashboard.tsx`:
tsx
interfaceName="ether1"  // Ganti ke interface yang diinginkan


### Ubah SNMP Host/Community
Edit `app/Services/SnmpService.php`:
php
public function __construct(
    string $host = '192.168.1.1',      // Ubah IP
    string $community = 'private',     // Ubah community string
    // ...
)


### Ubah Chart Warna
Edit `resources/js/Components/Traffic/TrafficChart.tsx`:
tsx
<Line stroke="#FF5733" />  // Ubah hex color
<Bar fill="#33FF57" />


### Tambah Metric Baru
1. Tambah OID baru di `app/Services/SnmpService.php`
2. Update `TrafficResponse` type di `resources/js/types/traffic.ts`
3. Update component untuk tampilkan metric baru

## Quick Start Checklist

- [ ] Verifikasi PHP SNMP module terinstall
- [ ] Setup SNMP di MikroTik (Community string = 'public')
- [ ] Test SNMP connectivity dengan snmpwalk
- [ ] Clear Laravel cache: `php artisan cache:clear`
- [ ] Visit dashboard di http://localhost:8000/dashboard
- [ ] Lihat traffic chart untuk interface pppoe-namaUserAuth
- [ ] Sesuaikan interface name sesuai kebutuhan

---

**Last Updated:** March 2026
**Version:** 1.0.0
