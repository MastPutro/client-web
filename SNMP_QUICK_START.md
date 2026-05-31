# SNMP Traffic Monitoring - Quick Start Guide

**Sistem monitoring traffic MikroTik PPPoE interface via SNMP telah siap digunakan!**

## ✅ Files yang Sudah Dibuat

### Backend (Laravel)
- **`app/Services/SnmpService.php`** (6.6K)
  - Service untuk handle SNMP queries ke MikroTik
  - Method untuk get interface traffic, history, dan list interfaces
  - Includes utility functions untuk parse SNMP data

- **`app/Http/Controllers/TrafficController.php`** (5.2K)
  - API endpoints untuk traffic data
  - Method: getInterfaceTraffic, getInterfaceTrafficHistory, getInterfaces
  - PPPoE-specific endpoints

- **`routes/api.php`** (Updated)
  - 5 API routes terbaru untuk traffic monitoring:
    - GET /api/traffic/interfaces
    - GET /api/traffic/{interfaceName}
    - GET /api/traffic/{interfaceName}/history
    - GET /api/traffic/pppoe/{interfaceName}
    - GET /api/traffic/pppoe/{interfaceName}/history

### Frontend (React)
- **`resources/js/Components/Traffic/TrafficChart.tsx`** (12K)
  - Main chart component dengan Recharts
  - Features: Line/Bar chart, stats cards, throughput monitoring
  - Auto-refresh support

- **`resources/js/Components/Traffic/TrafficWidget.tsx`** (4.5K)
  - Compact widget untuk quick overview
  - Ideal untuk dashboard atau sidebar

- **`resources/js/Components/Traffic/index.ts`** (0.2K)
  - Export file untuk mudah import components

- **`resources/js/types/traffic.ts`** (1.2K)
  - TypeScript interfaces untuk type safety

- **`resources/js/Pages/Dashboard.tsx`** (Updated)
  - Dashboard sudah diupdate dengan TrafficChart & TrafficWidget
  - Default interface: pppoe-namaUserAuth
  - Ready to use!

### Documentation
- **`SNMP_MONITORING_SETUP.md`** (12K)
  - Dokumentasi lengkap dengan setup instructions
  - API endpoints reference
  - Troubleshooting guide
  - OID reference

## 🚀 Next Steps untuk Go Live

### 1. **Verifikasi PHP SNMP Module** (5 menit)
```bash
php -m | grep snmp
```

Jika tidak ada output, install:
```bash
# Ubuntu/Debian
sudo apt-get install php-snmp
sudo systemctl restart php8.1-fpm

# WSL Ubuntu
sudo apt update && sudo apt install -y php-snmp
```

### 2. **Setup MikroTik SNMP** (10 menit)
Akses MikroTik via WebUI/SSH:
```
System → SNMP
- Enable SNMP service
- Community: public
- Trap Community: public
- Allowed Addresses: [Your Server IP] (or 0.0.0.0/0 for open access)
```

Atau via terminal:
```
/ip service set snmp disabled=no
/snmp community set numbers=0 name=public
/snmp set trap-community=public enabled=yes
```

### 3. **Test SNMP Connectivity** (2 menit)
```bash
# List all interfaces
snmpwalk -v 2c -c public 12.20.20.1 1.3.6.1.2.1.2.2.1.2

# Should output something like:
# iso.3.6.1.2.1.2.2.1.2.1 = STRING: "ether1"
# iso.3.6.1.2.1.2.2.1.2.8 = STRING: "pppoe-namaUserAuth"
```

### 4. **Clear Laravel Cache** (1 menit)
```bash
cd /home/putro/client-web
php artisan cache:clear
php artisan config:cache
```

### 5. **Start Laravel Server** (2 menit)
```bash
# Terminal 1: Start Laravel
php artisan serve

# Terminal 2 (optional): Watch for changes
npm run dev
```

### 6. **Access Dashboard**
```
http://localhost:8000/dashboard
```

You should see:
- Traffic widget dengan real-time data
- Interactive line chart showing throughput
- Cumulative data transfer chart
- Stats cards showing In/Out rates

## 📊 Chart Features

### TrafficChart Component
- **Throughput Chart**: Real-time in/out traffic rates (Mbps)
- **Data Transfer Chart**: Cumulative octets transferred (MB)
- **Stats Cards**: 
  - Current Incoming Rate (Mbps)
  - Current Outgoing Rate (Mbps)
  - Total Data In (MB)
  - Total Data Out (MB)
- **Auto-refresh**: Every 30 seconds (customizable)
- **Manual refresh**: Click Refresh button
- **Error handling**: Retry button jika ada error

### TrafficWidget Component
- Compact quick overview
- Shows current in/out rates
- Interface status indicator
- Perfect untuk sidebar atau multiple interfaces

## 🔧 Customization

### Ganti Interface Name
Edit `resources/js/Pages/Dashboard.tsx`:
```tsx
interfaceName="ether1"  // atau interface name apapun
interfaceLabel="Ether1 - Main Uplink"
```

### Ganti Refresh Interval
```tsx
refreshInterval={60000}  // 60 detik (default 30 detik)
```

### Ganti Chart Type
```tsx
chartType="bar"  // dari 'line' ke 'bar'
```

### Monitor Multiple Interfaces
```tsx
const interfaces = ['ether1', 'ether2', 'pppoe-namaUserAuth'];

{interfaces.map(iface => (
    <TrafficWidget key={iface} interfaceName={iface} />
))}
```

## 🔗 API Usage Examples

### Get All Interfaces
```bash
curl http://localhost:8000/api/traffic/interfaces
```

### Get Current Traffic
```bash
curl "http://localhost:8000/api/traffic/pppoe/pppoe-namaUserAuth"
```

### Get Traffic History (untuk chart)
```bash
curl "http://localhost:8000/api/traffic/pppoe/pppoe-namaUserAuth/history?samples=20&interval=5"
```

## 🐛 Troubleshooting

### "Error fetching traffic data"
1. Check SNMP module: `php -m | grep snmp`
2. Check MikroTik connectivity: `ping 12.20.20.1`
3. Check logs: `tail -f storage/logs/laravel.log`
4. Test SNMP: `snmpget -v 2c -c public 12.20.20.1 1.3.6.1.2.1.1.1.0`

### "Interface 'pppoe-namaUserAuth' not found"
1. List available interfaces on MikroTik:
   ```bash
   snmpwalk -v 2c -c public 12.20.20.1 1.3.6.1.2.1.2.2.1.2
   ```
2. Copy the actual interface name
3. Update `interfaceName` in Dashboard.tsx

### Chart tidak muncul
1. Buka DevTools (F12) → Network tab
2. Check `/api/traffic/...` request response
3. Verify SNMP service running di MikroTik
4. Check Laravel logs for SNMP errors

## 📈 Performance Tips

1. **Reduce sample rate untuk high-traffic scenarios:**
   ```tsx
   samples={5}  // Lebih sedikit, lebih responsive
   interval={10}
   ```

2. **Increase refresh interval untuk low latency environments:**
   ```tsx
   refreshInterval={60000}  // Check every 60 seconds
   ```

3. **Cache API response di Laravel (future enhancement):**
   ```php
   Cache::remember('traffic.'.$interface, 60, function() {
       return $this->snmpService->getInterfaceTraffic($interface);
   });
   ```

## 📚 Full Documentation

Lihat `SNMP_MONITORING_SETUP.md` untuk:
- Detail setup steps
- API endpoint reference
- Component props
- SNMP OID reference
- Advanced troubleshooting

## ✨ File Summary

| File | Size | Purpose |
|------|------|---------|
| SnmpService.php | 6.6K | Backend SNMP logic |
| TrafficController.php | 5.2K | API endpoints |
| TrafficChart.tsx | 12K | Main chart UI |
| TrafficWidget.tsx | 4.5K | Quick widget |
| traffic.ts | 1.2K | TypeScript types |
| SNMP_MONITORING_SETUP.md | 12K | Full documentation |

**Total new code: ~41. KB**

## 🎯 Success Checklist

- [ ] PHP SNMP module installed & verified
- [ ] MikroTik SNMP service enabled & configured
- [ ] SNMP connectivity tested with snmpwalk
- [ ] Laravel cache cleared
- [ ] Dashboard accessible at /dashboard
- [ ] Traffic data displayed on chart
- [ ] Auto-refresh working
- [ ] Manual refresh button working
- [ ] No errors in Laravel logs

---

**Setup Time:** ~30-45 minutes
**Difficulty Level:** Medium
**Support Files:** SNMP_MONITORING_SETUP.md

**Ready to go!** 🚀
