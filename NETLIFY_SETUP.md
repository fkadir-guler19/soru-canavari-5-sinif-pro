# Netlify Deploy Kurulum Rehberi

**Sorun:** "Robotumuz soruları hazırlarken bir bağlantı hatası yaşadı" hatası alıyorsanız, aşağıdaki adımları takip edin.

## 1. Google Gemini API Anahtarını Al

- https://aistudio.google.com adresine git
- **Get API Key** butonuna tıkla
- **Create API key in new project** seçeneğini seç
- Anahtarı kopyala (bir yere kaydet, tekrar göremezsin!)

## 2. Netlify Ortam Değişkenini Ayarla

### Adım 1: Netlify Dashboard'a Git
- https://app.netlify.com adresine git
- Giriş yap (GitHub hesabınızla)

### Adım 2: Siteni Seç
- **sorucanavari** (veya adı ne ise) sitesini seç

### Adım 3: Site Settings'e Git
- Üst menüde **Site settings** butonuna tıkla

### Adım 4: Build & Deploy → Environment
- Sol menüde **Build & deploy** → **Environment**'e tıkla

### Adım 5: Environment Variables Ekle
- **Edit variables** butonuna tıkla
- **Add a variable** seçeneğine tıkla
- **Key:** `API_KEY` (büyük harfle!)
- **Value:** Google API anahtarını yapıştır (adım 1'de kopyaladığın)
- **Save** butonuna tıkla

### Adım 6: Deploy Tetikle
- Hala **Build & deploy** → **Environment** sayfasındaysan, aşağıya kaydır
- **Trigger deploy** veya **Deploy site** bölümünde **Trigger deploy** butonuna tıkla

## 3. Deploy'ı Kontrol Et

- **Deployments** sekmesine git
- Yeni deploy'ın başlandığını göreceksin
- Deploy tamamlanana kadar bekle (yeşil "Published" yazısı görünene)

## 4. Siteyi Test Et

- https://sorucanavari.netlify.app adresine git
- Quiz oluşturmayı deneyin
- Hata devam ederse aşağıdaki sorun gidermeyi kontrol et

## Sorun Giderme

### Deploy Başlamadı
- **Deployments** > **Trigger deploy** buton-tekrar tıkla
- GitHub'ta push yaptığında otomatik deploy tetiklemesi için Netlify bağlı olması gerekir

### Deploy Başladı Ama Başarısız Oldu
- **Deployments** > Kırmızı deploy'a tıkla
- Deploy logs'unu aç
- Hata mesajını oku:
  - `netlify.toml` syntax hatası → [FIXED] güncelle
  - Diğer hata → Hata mesajını bana yazarsan bakarım

### Quiz Oluştururken Hata Alıyorum
- Browser'ı kapatıp yeniden aç (cache temizle)
- Tarayıcı Developer Tools'u aç (F12 → Console)
- Quiz oluşturmaya çalış
- Console'da kırmızı error mesajı görürsen yaz
- **Network** sekmesine git → `generate` isteğini ara
  - Eğer kürmızı (404, 500 vs) görmüyorsan → API_KEY ayarlanmamış
  - HTTP 500 görmüyorsan → API hatası (logs'ta detay var)

### API_KEY Hala Ayarlanmadı Diye Hata Alıyorum
1. Netlify Dashboard > Site Settings > Build & deploy > Environment kontrol et
2. `API_KEY` yazısı doğru yazıldı mı kontrol et (BÜYÜK HARF)
3. Value bölümü boş mu kontrol et (kopyala-yapıştır yap)
4. **Trigger deploy** butonuna tıkla (yeni bir deploy tetikle)
5. Deploy tamamlanırsa site yeniden denemeyi deneyin

## Güvenlik Notu ⚠️

- **Anahtarı asla GitHub'a commitleme!** (.gitignore'da `.env.local` var, ama dikkat et
- Netlify ortam değişkenlerinde sakla (server-side güvenlidir)
- Başkalarına gösterme!

## Hala Çözülmediyse

1. Browser console'dan hata mesajını kopyala
2. Netlify deploy logs'tan ilgili hata satırlarını kopyala
3. Bana yazarsan bakarim 😊
