// Gerekli kütüphaneleri dahil ediyoruz
const { Client } = require('discord.js-self'); // Kütüphane adı değişti
require('dotenv').config();

// Yeni bir client (istemci) oluşturuyoruz
const client = new Client();

// Bot hazır olduğunda çalışacak olan kod
client.on('ready', () => {
  console.log(`✅ ${client.user.username} olarak giriş yapıldı!`);
  console.log('Ses kanalına bağlanılıyor...');
  joinChannel();
});

// Otomatik yeniden bağlanma mantığı
client.on('voiceStateUpdate', (oldState, newState) => {
  if (oldState.id === client.user.id && oldState.channelID && !newState.channelID) {
    console.log('⚠️ Ses kanalından bağlantı koptu. 10 saniye içinde yeniden bağlanılıyor...');
    setTimeout(() => {
      joinChannel();
    }, 10000);
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
      await channel.join();
      console.log(`🎧 Başarıyla "${channel.name}" adlı ses kanalına bağlanıldı!`);
    } else {
      console.error(`❌ HATA: "${voiceChannelId}" ID'li bir ses kanalı bulunamadı veya bu bir ses kanalı değil.`);
    }
  } catch (error) {
    console.error("❌ Ses kanalına bağlanırken bir hata oluştu:", error.message);
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
