<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Soru Canavarı 5. Sınıf Pro - AI İçerik Yönetimi

Web tabanlı bir eğitim uygulaması. Yapay zeka (Google Gemini) ile 5. sınıf müfredata uygun sorular oluşturur, öğrencilerin çözmesi için sunar.

## Özellikler
- 🤖 Google Gemini API ile soru otomatik oluşturma
- 📊 Öğrenci İlerleme Takibi (Level, Puan Sistemi)
- ⏱️ Zaman Sınırlı Quizler
- 📱 Responsive Tasarım
- 🌐 Netlify'de üretim deploy

## Kurulum (Yerelde)

**Ön Koşullar:** Node.js (v18+)

```bash
npm install
```

**Ortam Değişkenleri (.env.local):**
```dotenv
VITE_API_BASE=/api/generate
```

**Geliştirme Sunucusunu Başlat:**
```bash
npm run dev
```

Frontend'de: http://localhost:3000  
Backend'de (ayrı terminalde):
```bash
npm run start:server
```
Sunucu: http://localhost:5174

## Üretim Deploy (Netlify)

1. **GitHub'a Push Et:**
   ```bash
   git add .
   git commit -m "Netlify fonksiyonu ve ortam değişkenleri ekle"
   git push origin main
   ```

2. **Netlify Site Ayarları:**
   - https://app.netlify.com adresine git → siteni seç
   - **Site settings** → **Build & deploy** → **Environment**
   - **Environment variables** bölümüne ekle:
     - **Key:** `API_KEY`
     - **Value:** Google API anahtarını yapıştır
   - (Opsiyonel) **Web Functions** → Memory'i 1024 MB olarak ayarla

3. **Deploy Tetikle:**
   - GitHub'a push ettikten sonra Netlify otomatik deploy eder
   - Logs sayfasında ilerlemeyi izle

## Sorun Giderme

- **"Robotumuz soruları hazırlarken bir bağlantı hatası yaşadı" hatası:**
  - ✅ API_KEY Netlify environment variables'da set mi kontrol ed
  - ✅ Netlify build logs'unda daha fazla hata mesajı görülebilir
  - ✅ Tarayıcı Developer Tools → Network tab'ında `/.netlify/functions/generate` isteğini kontrol et

## Yapı
```
├── App.tsx              # Ana uygulama
├── services/
│   ├── geminiService.ts # Gemini API çağrısı
│   └── questionLogger.ts # Google Sheets entegrasyonu
├── netlify/
│   └── functions/
│       └── generate.js  # Netlify sunucusuz fonksiyonu
├── vite.config.ts       # Vite yapılandırması
├── netlify.toml         # Netlify yapılandırması
└── README.md            # Bu dosya
```
