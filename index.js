// Gerekli kütüphaneleri dahil ediyoruz
const { Client } = require('discord.js-self');
require('dotenv').config();

// Yeni bir client (istemci) oluşturuyoruz
const client = new Client();

// YENİ: Ses bağlantısını saklamak için bir değişken oluşturuyoruz
let voiceConnection = null;
const RECONNECT_DELAY = 10000; // 10 saniye
const STAY_ALIVE_INTERVAL = 240000; // 4 dakika (milisaniye cinsinden)

// Bot hazır olduğunda çalışacak olan kod
client.on('ready', async () => {
  console.log(`✅ ${client.user.username} olarak giriş yapıldı!`);
  console.log('Ses kanalına bağlanılıyor...');
  await joinChannel(); // İlk bağlantının tamamlanmasını bekle

  // YENİ: Bota aktif kalması için periyodik sinyal gönderme işlemini başlat
  if (voiceConnection) {
    setInterval(stayActive, STAY_ALIVE_INTERVAL);
    console.log(`📢 "Aktif Kalma" döngüsü her ${STAY_ALIVE_INTERVAL / 60000} dakikada bir çalışacak şekilde ayarlandı.`);
  }
});

// Otomatik yeniden bağlanma mantığı
client.on('voiceStateUpdate', (oldState, newState) => {
  if (oldState.id === client.user.id && oldState.channelID && !newState.channelID) {
    console.log(`⚠️ Ses kanalından bağlantı koptu. ${RECONNECT_DELAY / 1000} saniye içinde yeniden bağlanılıyor...`);
    voiceConnection = null; // Bağlantı koptuğu için değişkeni sıfırla
    setTimeout(joinChannel, RECONNECT_DELAY);
  }
});

// Ses kanalına bağlanma fonksiyonu
async function joinChannel() {
  const voiceChannelId = process.env.VOICE_CHANNEL_ID;

  if (!voiceChannelId) {
    console.error("❌ HATA: .env dosyasında VOICE_CHANNEL_ID değişkeni bulunamadı!");
    return;
  }

  try {
    const channel = await client.channels.fetch(voiceChannelId);
    if (channel && channel.type === 'voice') {
      // YENİ: Bağlantıyı değişkene ata
      voiceConnection = await channel.join();
      console.log(`🎧 Başarıyla "${channel.name}" adlı ses kanalına bağlanıldı!`);
    } else {
      console.error(`❌ HATA: "${voiceChannelId}" ID'li bir ses kanalı bulunamadı veya bu bir ses kanalı değil.`);
    }
  } catch (error) {
    console.error("❌ Ses kanalına bağlanırken bir hata oluştu:", error.message);
  }
}

// YENİ: Botun aktif olduğunu bildiren fonksiyon
function stayActive() {
  if (!voiceConnection) {
    console.log('📢 "Aktif Kalma" sinyali gönderilemedi: Ses bağlantısı yok.');
    return;
  }
  
  try {
    // Çok kısa bir süreliğine konuşuyor gibi yapıp hemen susturuyoruz.
    // Bu, Discord'a "aktif" olduğumuzu bildirir.
    voiceConnection.setSpeaking(true);
    setTimeout(() => {
      voiceConnection.setSpeaking(false);
    }, 500); // Yarım saniye sonra sus
  } catch (error) {
    console.error('📢 "Aktif Kalma" sinyali gönderilirken hata oluştu:', error.message);
  }
}

// .env dosyasından token'ı al ve bota giriş yap
const token = process.env.TOKEN;
if (!token) {
  console.error("❌ HATA: .env dosyasında TOKEN değişkeni bulunamadı!");
} else {
  client.login(token);
}

// Uptime için basit bir web sunucusu
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot aktif ve seste!');
}).listen(3000);
