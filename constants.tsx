
import { Subject, SubjectType } from './types';

export const CURRICULUM: Subject[] = [
  {
    type: SubjectType.TURKISH,
    icon: '📖',
    color: 'bg-rose-500',
    timePerQuestion: 90,
    units: [
      { id: 't1', name: '1. Bölüm: Sözcükte Anlam', topics: ['Çok anlamlılık', 'Gerçek/Mecaz/Terim', 'Eş/Zıt/Yakın Anlam', 'Deyim/Atasözü'] },
      { id: 't2', name: '2. Bölüm: Cümlede Anlam', topics: ['Öznel/Nesnel', 'Örtülü Anlam', 'Cümle Tamamlama', 'Duygu İfadeleri'] },
      { id: 't3', name: '3. Bölüm: Metinde Anlam', topics: ['Metin Türleri', 'Hikaye Unsurları', 'Paragraf Yapısı', 'Söz Sanatları'] },
      { id: 't4', name: '4. Bölüm: Dil Bilgisi', topics: ['İsimler', 'Sıfatlar', 'Zamirler'] },
      { id: 't5', name: '5. Bölüm: Beceri Temelli Sorular', topics: ['Sözel Mantık', 'Görsel Yorumlama', 'Grafik/Tablo Okuma'] },
      { id: 't6', name: '6. Bölüm: Yazım ve Noktalama', topics: ['Büyük Harfler', 'Sayıların Yazımı', 'Noktalama İşaretleri'] },
    ]
  },
  {
    type: SubjectType.MATH,
    icon: '🧮',
    color: 'bg-indigo-500',
    timePerQuestion: 120,
    units: [
      { id: 'm1', name: '1. Tema: Geometrik Şekiller', topics: ['Temel Kavramlar', 'Açılar', 'Çokgenler', 'Üçgen Çeşitleri'] },
      { id: 'm2', name: '2. Tema: Sayılar ve Nicelikler - I', topics: ['Doğal Sayılar', 'Dört İşlem', 'Tahmin', 'Problemler'] },
      { id: 'm3', name: '3. Tema: Geometrik Nicelikler', topics: ['Dikdörtgenin Çevresi', 'Alan Hesaplama', 'Çevre-Alan İlişkisi'] },
      { id: 'm4', name: '4. Tema: Sayılar ve Nicelikler - II', topics: ['Kesirler', 'Ondalık Gösterim', 'Yüzdeler'] },
      { id: 'm5', name: '5. Tema: İstatistiksel Araştırma', topics: ['Veri Toplama', 'Sütun Grafiği', 'Daire Grafiği'] },
      { id: 'm6', name: '6. Tema: İşlemlerle Cebirsel Düşünme', topics: ['Eşitlik', 'İşlem Önceliği', 'Karesi/Küpü', 'Örüntü/Algoritma'] },
      { id: 'm7', name: '7. Tema: Veriden Olasılığa', topics: ['Olayların Olasılığı', 'Olasılık Çeşitleri'] },
    ]
  },
  {
    type: SubjectType.SCIENCE,
    icon: '🔬',
    color: 'bg-emerald-500',
    timePerQuestion: 100,
    units: [
      { id: 'f1', name: '1. Ünite: Gökyüzündeki Komşularımız', topics: ['Güneş ve Ay', 'Dünya ile İlişkiler'] },
      { id: 'f2', name: '2. Ünite: Kuvveti Tanıyalım', topics: ['Kuvvet Ölçümü', 'Kütle ve Ağırlık', 'Sürtünme'] },
      { id: 'f3', name: '3. Ünite: Canlıların Yapısı', topics: ['Hücre', 'Destek ve Hareket Sistemi'] },
      { id: 'f4', name: '4. Ünite: Işığın Etkileşimi', topics: ['Işığın Yayılması', 'Tam Gölge Oluşumu'] },
      { id: 'f5', name: '5. Ünite: Maddenin Doğası', topics: ['Tanecikli Yapı', 'Isı ve Sıcaklık', 'Hal Değişimi'] },
      { id: 'f6', name: '6. Ünite: Yaşamımızdaki Elektrik', topics: ['Devre Sembolleri', 'Ampul Parlaklığı'] },
      { id: 'f7', name: '7. Ünite: Geri Dönüşüm', topics: ['Evsel Atıklar', 'Çevre Koruma'] },
    ]
  },
  {
    type: SubjectType.SOCIAL,
    icon: '🌍',
    color: 'bg-orange-500',
    timePerQuestion: 60,
    units: [
      { id: 's1', name: '1. Öğrenme Alanı: Birlikte Yaşamak', topics: ['Gruplar ve Roller', 'Yardımlaşma'] },
      { id: 's2', name: '2. Öğrenme Alanı: Evimiz Dünya', topics: ['Göreceli Konum', 'Afetler', 'Komşu Ülkeler'] },
      { id: 's3', name: '3. Öğrenme Alanı: Ortak Mirasımız', topics: ['Anadolu Medeniyetleri', 'Mezopotamya'] },
      { id: 's4', name: '4. Öğrenme Alanı: Demokrasimiz', topics: ['Cumhuriyet', 'Hak ve Sorumluluklar'] },
      { id: 's5', name: '5. Öğrenme Alanı: Ekonomi', topics: ['Bütçe Planlama', 'Kaynak Kullanımı'] },
      { id: 's6', name: '6. Öğrenme Alanı: Teknoloji', topics: ['Toplumsal Etki', 'Bilinçli Kullanım'] },
    ]
  },
  {
    type: SubjectType.RELIGION,
    icon: '🕌',
    color: 'bg-teal-600',
    timePerQuestion: 60,
    units: [
      { id: 'd1', name: '1. Ünite: Allah İnancı', topics: ['Evrendeki Düzen', 'İhlas Suresi'] },
      { id: 'd2', name: '2. Ünite: Namaz', topics: ['Namazın Kılınışı', 'Tahiyyat Duası'] },
      { id: 'd3', name: '3. Ünite: Kur\'an-ı Kerim', topics: ['Kur\'an\'ın Düzeni', 'Kevser Suresi'] },
      { id: 'd4', name: '4. Ünite: Peygamber Kıssaları', topics: ['Peygamberlik Kavramı', 'Kureyş Suresi'] },
      { id: 'd5', name: '5. Ünite: Mimaride Dini Motifler', topics: ['Cami Bölümleri', 'Dinin Etkisi'] },
    ]
  },
  {
    type: SubjectType.ENGLISH,
    icon: '🇬🇧',
    color: 'bg-blue-600',
    timePerQuestion: 75,
    units: [
      { id: 'e0', name: 'Starter: Welcome!', topics: ['Numbers', 'Colors', 'Classroom objects', 'Verb Be'] },
      { id: 'e1', name: 'Unit 1: Friends and Family', topics: ['Describing people', 'Have got', 'Possessives'] },
      { id: 'e2', name: 'Unit 2: That’s Life!', topics: ['Daily routines', 'Present Simple', 'Adverbs of frequency'] },
      { id: 'e3', name: 'Unit 3: School Days', topics: ['Subjects', 'Can/Can\'t', 'Likes/Dislikes'] },
      { id: 'e4', name: 'Unit 4: You Are What You Eat', topics: ['Food & Drink', 'Countable/Uncountable', 'Some/Any'] },
      { id: 'e5', name: 'Unit 5: What’s Your Style?', topics: ['Clothes', 'Present Continuous vs Simple'] },
      { id: 'e6', name: 'Unit 6: Sport for Life', topics: ['Sports verbs', 'Comparatives & Superlatives'] },
      { id: 'e7', name: 'Unit 7: Amazing Animals', topics: ['Was/Were', 'Past Simple', 'Animals adjectives'] },
      { id: 'e8', name: 'Unit 8: Lost and Found', topics: ['Places in town', 'Past Simple Qs', 'Wh- Questions'] },
      { id: 'e9', name: 'Unit 9: Summer Fun', topics: ['Will/Won\'t', 'Be going to', 'Holiday activities'] },
    ]
  }
];

// Kullanıcının "flat vector", "white body with blue/orange accents" tarifine uygun v9 bottts API linkleri.
// baseColor=ffffff (Beyaz), primaryColor=06b6d4 (Mavi/Cyan), secondaryColor=f97316 (Turuncu)
export const MONSTER_STAGES = [
  'https://api.dicebear.com/9.x/bottts/svg?seed=Buddy&baseColor=ffffff&eyes=eyes01&mouth=smile01&texture=none&primaryColor=06b6d4&secondaryColor=f97316&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/bottts/svg?seed=Lucky&baseColor=ffffff&eyes=eyes02&mouth=smile02&texture=none&primaryColor=06b6d4&secondaryColor=f97316&backgroundColor=ffd5dc',
  'https://api.dicebear.com/9.x/bottts/svg?seed=Hero&baseColor=ffffff&eyes=eyes12&mouth=smile01&texture=none&primaryColor=06b6d4&secondaryColor=f97316&backgroundColor=c1f2c7',
  'https://api.dicebear.com/9.x/bottts/svg?seed=Professor&baseColor=ffffff&eyes=eyes15&mouth=smile01&texture=none&primaryColor=06b6d4&secondaryColor=f97316&backgroundColor=ffdfbf'
];

export const MASCOT_THINKING = 'https://api.dicebear.com/9.x/bottts/svg?seed=Thinker&baseColor=ffffff&eyes=eyes19&mouth=smile01&texture=none&primaryColor=06b6d4&secondaryColor=f97316&backgroundColor=e2e8f0';
export const MASCOT_VICTORY = 'https://api.dicebear.com/9.x/bottts/svg?seed=Winner&baseColor=ffffff&eyes=eyes23&mouth=smile02&texture=none&primaryColor=06b6d4&secondaryColor=f97316&backgroundColor=fef08a';

export const LEVEL_THRESHOLD = 300;
