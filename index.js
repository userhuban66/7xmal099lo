// Gerekli kütüphaneleri dahil ediyoruz
const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel } = require('@discordjs/voice');
require('dotenv').config(); // .env dosyasındaki değişkenleri yükler

// Yeni bir client (istemci) oluşturuyoruz
const client = new Client({
  // Kütüphane güncelleme kontrolünü kapatmak, hataları önleyebilir
  checkUpdate: false,
});

// Bot hazır olduğunda çalışacak olan kod
client.on('ready', () => {
  console.log(`✅ ${client.user.username} olarak giriş yapıldı!`);
  console.log('Ses kanalına bağlanılıyor...');
  
  // Fonksiyonu ilk defa burada çağırarak bota kanala katılmasını söylüyoruz
  joinChannel(); 
});

// Otomatik yeniden bağlanma mantığı
client.on('voiceStateUpdate', (oldState, newState) => {
  // Eğer güncellenen kişi bizim botumuz ise
  if (oldState.member.user.id === client.user.id) {
    // Ve bot kanaldan ayrıldıysa (eski kanalı var ama yeni kanalı yoksa)
    if (oldState.channelId && !newState.channelId) {
      console.log('⚠️ Ses kanalından bağlantı koptu. 10 saniye içinde yeniden bağlanılıyor...');
      // Tekrar bağlanmak için fonksiyonu 10 saniye sonra çağır
      setTimeout(() => {
        joinChannel();
      }, 10000); // 10 saniye bekleme süresi
    }
  }
});


// Ses kanalına bağlanma fonksiyonu
function joinChannel() {
  const voiceChannelId = process.env.VOICE_CHANNEL_ID;

  if (!voiceChannelId) {
    console.error("❌ HATA: .env dosyasında VOICE_CHANNEL_ID değişkeni bulunamadı!");
    return;
  }

  // Kanalı ID'si ile bul
  const channel = client.channels.cache.get(voiceChannelId);

  // Eğer kanal bulunamazsa veya ses kanalı değilse hata ver
  if (!channel || channel.type !== 'GUILD_VOICE') {
    console.error(`❌ HATA: "${voiceChannelId}" ID'li bir ses kanalı bulunamadı veya bu bir ses kanalı değil.`);
    return;
  }

  try {
    // Ses kanalına katıl
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: true,  // Kendini sağırlaştırır, gereksiz veri akışını önler
      selfMute: false, // İsteğe bağlı, true yaparsanız seste susturulmuş olur
    });
    console.log(`🎧 Başarıyla "${channel.name}" adlı ses kanalına bağlanıldı!`);
  } catch (error) {
    console.error("❌ Ses kanalına bağlanırken bir hata oluştu:", error);
  }
}

// .env dosyasından token'ı al ve bota giriş yap
const token = process.env.TOKEN;
if (!token) {
  console.error("❌ HATA: .env dosyasında TOKEN değişkeni bulunamadı!");
} else {
  client.login(token);
}

// Uptime için basit bir web sunucusu (Render'ın uykuya dalmasını engeller)
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Bot aktif ve seste!');
}).listen(3000);
