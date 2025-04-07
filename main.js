const fs = require('fs');
const { Client, GatewayIntentBits, WebhookClient, MessageEmbed, Partials } = require('discord.js');
const uptime = require("moment");
const chalk = require("chalk");
require("moment-duration-format");
const util = require('util');
const { JsonDatabase } = require("wio.db");
const database = new JsonDatabase({ databasePath: "./database.json" });
const databaseservers = new JsonDatabase({ databasePath: "./servers.json" });
const origConsoleLog = console.log;

let bottoken = "token";

console.log = function () {
    const now = new Date();
    const options = {
        timeZone: 'Europe/Istanbul',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    const formattedDate = chalk.rgb(51, 255, 153)('[' + now.toLocaleString('tr-TR', options) + ']');
    const args = Array.from(arguments);
    args.unshift(formattedDate);
    origConsoleLog.apply(console, args);
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ],
    'partials': [Partials.Channel]
});

Partials.Channel; // 1

client.on("ready", () => {
    console.log(chalk.rgb(0, 184, 230)("-| WCK <> ") + chalk.rgb(102, 255, 153)("License-Key: ") + chalk.rgb(204, 255, 102)("WCK-DEV-LICENSE"));
    console.log(chalk.rgb(0, 184, 230)("-| WCK <> ") + chalk.rgb(102, 255, 153)("Eternity - Automatic - Boost - Delivery") + chalk.rgb(204, 255, 102)(" | Made By Wicker"));
});

setInterval(function () {
    var liste = ['🤖 Discord Server-Boost Booster', '💻 development by "wicker" ', '❤️ Eternity © 2024']
    var random = Math.floor(Math.random() * (liste.length - 0 + 1) + 0);
    client.user.setActivity(liste[random], "");
}, 3 * 1000);

const savedServers = database.get('servers') || []; // varsayılan olarak boş bir dizi

const savedServersID = database.get('serversid') || []; // varsayılan olarak boş bir dizi

const serverboostcodes = fs.readFileSync('datas/codes/server-boost-codes.txt', 'utf-8').split('\r\n').filter(Boolean);

let lastserver = 0;
let lastserverID = 0;

let teslim_alma = false;

let authorid = "0";

let serverLink = "undefined";

client.on("messageCreate", async (message) => {


    async function sendsuccesalert() {
        const guild = client.guilds.cache.get("1040942180384120873");

        if (!guild) {
            console.log("Sunucu bulunamadı");
            return;
        }

        const wickerids = ["1154655380975140934", authorid];

        for (const wickerid of wickerids) {
            try {
                const member = await guild.members.fetch(wickerid);
                const dmchannel = await member.createDM();
                await dmchannel.send("**·** Server-Boost gönderim işlemi başarıyla tamamlandı ❤️");
            } catch (error) {
                console.error(`${wickerid} ID'li üyeye DM gönderirken hata oluştu:`, error);
            }
        }
    }

    if (!message.guild) {
        if (message.content === "w!teslimal") {
            if (teslim_alma === true) { // kullanıcı zaten teslim alma işlemi yapıyorsa, yeni bir işlem yapmasına izin verme
                message.channel.send("Şu anda bir teslim alma işlemi zaten gerçekleştiriliyor. Lütfen bekleyin.");
                return;
            }
            teslim_alma = true;
            console.log(chalk.rgb(0, 184, 230)("-| WCK <> ") + chalk.rgb(213, 128, 255)("w!teslimal komutu") + chalk.rgb(204, 255, 102)(" {" + "kullanıldı" + "}"));

            authorid = message.author.id; // authoridyi güncelle

            message.channel.send("**·** Hangi ürünü teslim almak istiyorsun? | `server-boost`");
            const filter = (response) => {
                return ['server-boost'].includes(response.content.toLowerCase()) && response.author.id === message.author.id;
            };

            const collector = message.channel.createMessageCollector({ filter, time: 15000, max: 1 });
            collector.on('collect', (m) => {
                if (m.content === 'server-boost') {
                    message.channel.send("**·** Server-Boost gönderimini başlatmak için sana teslim edilen ürün kodunu yazmalısın.");

                    const serverboostcollector = message.channel.createMessageCollector({ filter: (response) => response.author.id === message.author.id, time: 15000, max: 1 });

                    serverboostcollector.on('collect', (serverboostcode) => {
                        if (serverboostcodes.includes(serverboostcode.content)) {
                            console.log(chalk.rgb(0, 184, 230)("-| WCK <> ") + chalk.rgb(213, 128, 255)("Server-Boost ürün kodu") + chalk.rgb(204, 255, 102)(" {" + "doğrulandı" + "}"));
                            message.channel.send("**·** Ürün kodunu başarıyla doğruladım. Şimdi ise **Sunucu Link**'ini doğru bir şekilde girmelisin.\n\n **! LÜTFEN SINIRSIZ SÜRELİ OLARAK AYARLA VE DAVET KODUNU HİZMETİN DEVAM ETTİĞİ SÜRECE SİLME !** \nÖrnek: https://discord.gg/eternityboost");
                            // Kullanıcıdan server ID'sini sorma

                            const serverLinkCollector = message.channel.createMessageCollector({ filter: (response) => response.author.id === message.author.id, time: 60000, max: 1 });

                            serverLinkCollector.on('collect', (serverLink) => {
                                if (serverLink.content.startsWith("https://discord.gg/")) {
                                    console.log(chalk.rgb(0, 184, 230)("-| WCK <> ") + chalk.rgb(213, 128, 255)("SERVER Link filtresi") + chalk.rgb(204, 255, 102)(" {" + serverLink.content + "}"));
                                    message.channel.send("**·** Sunucu Link'iniz başarılı bir şekilde doğrulandı. | **" + serverLink.content + "**");
                                    // Burada sunucu ID'sini kullanarak gerekli işlemleri yapabilirsiniz
                                    lastserver = serverLink.content;

                                    const serverIDCollector = message.channel.createMessageCollector({ filter: (response) => response.author.id === message.author.id, time: 60000, max: 1 });

                                    message.channel.send("**·** Şimdi ise **Sunucu ID**'nı girmelisin.\n**·** Sunucu id'ni nasıl alacağını bilmiyorsan videoyu izleyebilirsin.\n\n📱 Mobile: `https://www.youtube.com/shorts/wy3DjWEyGLI` \n💻 Desktop: `https://www.alphr.com/discord-find-server-id/`");

                                    serverIDCollector.on('collect', (serverID) => {

                                        console.log(chalk.rgb(0, 184, 230)("-| WCK <> ") + chalk.rgb(213, 128, 255)("SERVER ID filtresi") + chalk.rgb(204, 255, 102)(" {" + serverID.content + "}"));
                                        message.channel.send("**·** Sunucu ID'niz başarılı bir şekilde doğrulandı. | **" + serverID.content + "**");
        
                                        // Burada sunucu ID'sini kullanarak gerekli işlemleri yapabilirsiniz
                                        lastserverID = serverID.content;

                                        message.channel.send("· Son olarak sunucundaki bütün anti-bot yazılımlarını kapatman gerekiyor.\nArdından onayla yazıp işlemi başlatabilirsin.\n Kapatmayı bilmiyorsan videoyu izleyebilirsin. · Rehber: https://youtube.com/")

                                        const antibotacceptcollector = message.channel.createMessageCollector({ filter: (response) => response.author.id === message.author.id, time: 60000, max: 1 });

                                        antibotacceptcollector.on('collect', (antibotaccept) => {
                                            if (antibotaccept.content === "onayla") {

                                                function processBoost(boostmonth, boostcount) {
                                                    database.set("boostmonth", boostmonth);
                                                    database.set("boostcount", boostcount);
                                                  //  redeemprocess();
                                                }

                                                const boostOptions = [
                                                    { key: "-1-MONTH-2x-BOOST", month: "1", count: "1" },
                                                    { key: "-1-MONTH-4x-BOOST", month: "1", count: "2" },
                                                    { key: "-1-MONTH-6x-BOOST", month: "1", count: "3" },
                                                    { key: "-1-MONTH-8x-BOOST", month: "1", count: "4" },
                                                    { key: "-1-MONTH-10x-BOOST", month: "1", count: "5" },
                                                    { key: "-1-MONTH-12x-BOOST", month: "1", count: "6" },
                                                    { key: "-1-MONTH-14x-BOOST", month: "1", count: "7" },
                                                    { key: "-3-MONTH-2x-BOOST", month: "3", count: "1" },
                                                    { key: "-3-MONTH-4x-BOOST", month: "3", count: "2" },
                                                    { key: "-3-MONTH-6x-BOOST", month: "3", count: "3" },
                                                    { key: "-3-MONTH-8x-BOOST", month: "3", count: "4" },
                                                    { key: "-3-MONTH-10x-BOOST", month: "3", count: "5" },
                                                    { key: "-3-MONTH-12x-BOOST", month: "3", count: "6" },
                                                    { key: "-3-MONTH-14x-BOOST", month: "3", count: "7" },
                                                ];

                                                const boostCode = serverboostcode.content; 
                                                console.log(boostCode)
                                                const matchingBoost = boostOptions.find(option => boostCode.includes(option.key));

                                                if (matchingBoost) {
                                                    processBoost(matchingBoost.month, matchingBoost.count);
                                                } else {
                                                    console.log("No matching boost found");
                                                }

                                                // kullanılan kodu silme
                                                const index = serverboostcodes.indexOf(serverboostcode.content);
                                                if (index > -1) {
                                                    serverboostcodes.splice(index, 1);
                                                    fs.writeFileSync('datas/codes/server-boost-codes.txt', serverboostcodes.join('\r\n'));
                                                    console.log(chalk.rgb(0, 184, 230)("-| WCK <> ") + chalk.rgb(213, 128, 255)("Ürün kodu sistem üzerinden") + chalk.rgb(204, 255, 102)(" {" + "kaldırıldı" + "}"));
                                                }

                                                savedServersID.push(serverID.content);
                                                database.set('serversid', savedServersID);

                                                savedServers.push(serverLink.content);
                                                database.set('servers', savedServers);

                                                // serversdata veri tabanı başlangıç

                                                //id al
                                                let savedserverid = serverID.content

                                                // boost süresi al

                                                // tarih al
                                                const currentdate = new Date();

                                                const newdate = new Date(currentdate);

                                                let savedservertime = database.get("boostmonth") - 1;

                                                if (savedservertime > 0) {
                                                    // 31 gün ekleyerek yeni tarihi al
                                                    newdate.setDate(currentdate.getDate() + 31);
                                                }

                                                // boost tokeni al
                                                let savedserverworker = database.get("boostcount");

                                                // invite link al
                                                let savedserverlink = serverLink.content;

                                                // kaçıncı server olduğunu belirt
                                                let totalservercount = databaseservers.get("totalserver") || 0;
                                                totalservercount++;
                                                databaseservers.set("totalserver", totalservercount);
                                                // verileri veri tabanına yazdır

                                                if (savedservertime > 0) {

                                                    const serverdata = [savedserverid, newdate, savedservertime, savedserverworker, savedserverlink]; // [0] - serverid | [1] - date | [2] - tokencount | [3] - workertoken | [4] - savedserverlink

                                                    databaseservers.set(String(totalservercount), serverdata);
                                                  //  console.log(databaseservers.get(String(totalservercount)));

                                                }

                                                // serversdata veri tabanı bitiş


                                                message.channel.send(`**·** Boost gönderim işlemin sıraya alındı.\n**·** Sıra Numaran: **${savedServers.length}**\n**·** Bizi tercih ettiğin için teşekkürler :heart:`);

                                                database.set("author", authorid)
                                                // yeni bir teslim alma isteğine izin verme
                                                teslim_alma = false;
                                            }

                                            antibotacceptcollector.on('end', (collected) => {
                                                if (collected.size === 0) {
                                                    message.channel.send('**·** Onaylama isteğin zaman aşımına uğradı.\n**·** Tekrardan istek oluşturabilirsin.');
                                                    teslim_alma = false;
                                                }
                                            });

                                        });


                                    });

                                } else {
                                    message.channel.send("**·** **Sunucu Link** formatınız yanlış.");
                                    console.log(chalk.rgb(0, 184, 230)("-| WCK <> ") + chalk.rgb(213, 128, 255)("Sunucu Link formatı") + chalk.rgb(204, 255, 102)(" {" + "yanlış" + "}"));
                                    teslim_alma = false;
                                }

                                serverLinkCollector.on('end', (collected) => {
                                    if (collected.size === 0) {
                                        message.channel.send('**·** Sunucu Link giriş izni zaman aşımına uğradı.\n**·** Tekrardan istek oluşturabilirsin.');
                                        teslim_alma = false;
                                    }
                                });

                            });

                        } else {
                            message.channel.send("**·** Ürün kodun yanlış gözüküyor. Bir sorun olduğunu düşünüyorsan yetkililere ulaşabilirsin.");
                            teslim_alma = false;
                        }
                    });

                }
            });

            collector.on('end', (collected) => {
                if (collected.size === 0) {
                    message.channel.send('**·** Ürün teslim alma isteğin zaman aşımına uğradı.');
                    teslim_alma = false;
                }
            });

        }
    }

});

let boostgondermeanlik = true;

const boostrepeatislemi = setInterval(() => {

    // Toplam sunucu sayısına kadar döngü

    if (boostgondermeanlik) {


        for (let i = 1; i <= databaseservers.get("totalserver"); i++) {
            // şuanki tarihi al
            const currentDate = new Date();

            // Her bir sunucu için veriyi al
            const serverData = databaseservers.get(String(i));

            // Eğer veri varsa konsola yazdır
            if (serverData) {
                const serverDate = new Date(serverData[1]); // Sunucu verisinin tarihini al
                let serverboosthakki = serverData[2]; // Sunucu verisinin boost hakkını al
                let serverboostid = serverData[0]; // Sunucu verisinin idsini al
                let serverboostworker = serverData[3]; // Sunucu verisinin boostworker değerini al
                let serverboostlink = serverData[4]; // Sunucu verisinin link değerini al

                // Tarih karşılaştırması
                if (currentDate > serverDate) {
                    // Sunucu boostu bitmiş demektir
                    console.log(`Sunucu ${i} Verisi Geçmiş Tarihe Sahip:`, serverDate);

                    // İşlem yoksa
                    if (boostgondermeanlik) {
                        // Boost hakkını güncelle
                        serverboosthakki--;

                        // Veriyi güncelle
                        serverData[2] = serverboosthakki;
                        databaseservers.set(String(i), serverData);

                        console.log(serverboosthakki);

                        if (serverboosthakki < 1) {
                            // Boost hakkı bitmişse işlem başlat ve tarihi güncellemeden veriyi sil
                            console.log("son hak kullanıldı")
                            // gönderim işlemi başlatma

                            let savedServersID = database.get('serversid') || [];
                            let savedServers = database.get('servers') || [];

                            savedServersID.push(serverboostid);
                            database.set('serversid', savedServersID);

                            savedServers.push(serverboostlink);
                            database.set('servers', savedServers);

                            database.set('boostmonth', serverboosthakki)
                            database.set('boostcount', serverboostworker)

                            // silme işlemi
                            databaseservers.delete(String(i));
                            console.log(`Sunucu ${i} verisi silindi.`);

                            boostgonderim();

                        } else {
                            // Boost hakkı bitmemişse tarihi güncelle (Buraya gerekli tarih güncelleme işlemini ekleyin)
                            console.log("hak var")
                            // tarih düzenle
                            serverDate.setDate(serverDate.getDate() + 31); // 31 gün ekle
                            // Sunucu verisinin tarihini güncelle
                            serverData[1] = serverDate.toISOString(); // tarihi ISO formatına dönüştür

                            // Veriyi güncelle
                            databaseservers.set(String(i), serverData);
                            console.log(serverDate)

                            let savedServersID = database.get('serversid') || [];
                            let savedServers = database.get('servers') || [];

                            savedServersID.push(serverboostid);
                            database.set('serversid', savedServersID);

                            savedServers.push(serverboostlink);
                            database.set('servers', savedServers);

                            database.set('boostmonth', serverboosthakki)
                            database.set('boostcount', serverboostworker)


                        }
                    }
                } else {
                    
                //    console.log(`Sunucu ${i} Verisi Geçerli Tarih:`, serverDate);
                }
            } else {
            //    console.log(`Sunucu ${i} için veri bulunamadı.`);
            }
        }

    }

}, 5 * 1000)

let totalJoined = -1;

const boostgonderimislemi = setInterval(() => {
    const savedServers = database.get('servers') || [];
    const savedServersID = database.get('serversid') || [];

    if (boostgondermeanlik === true) {
        if (savedServers.length === 0) {
            // Herhangi bir sunucu yoksa burada bir işlem yapabilirsiniz.
        } else {
            console.log(chalk.rgb(0, 184, 230)("-| WCK <> ") + chalk.rgb(213, 128, 255)("Gönderim aşamasında olan sunucu işleme koyuldu.") + chalk.rgb(204, 255, 102)(" {" + savedServers[0] + "}"));
            let guildId = savedServers[0];
            boostgondermeanlik = false;

            const gradient = require("gradient-string");
            const config = require("./config.json");
            const { Client } = require("discord.js-selfbot-v13");
            const HttpsProxyAgent = require("https-proxy-agent");
            const fs = require("fs");
            let inviteCode = savedServers[0];
            console.log(inviteCode);

            const proxies = fs.readFileSync("proxies.txt").toString().split("\n");

            const tokens = fs.readFileSync("datas/joiner-data/tokens.txt").toString().split("\n");

            let tokenIndex = 0;

            const intervalId = setInterval(async () => {
                const token = tokens[tokenIndex]?.trim()?.replace("\r", "")?.replace("\n", "");
                await doEverything(token);
                tokenIndex++;

                if (tokenIndex >= tokens.length) {
                    clearInterval(intervalId);
                    console.log("İşlem bitti");
                    boostgondermeanlik = true;
                    totalJoined = 0;
                    savedServers.shift();
                    database.set('servers', savedServers);
                }
            }, config.joinDelay);

            async function doEverything(token) {
                const boostCount = database.get("boostcount");
                totaljoined++;
                console.log("totaljoined => " + totalJoined);
                console.log("count => " + boostCount);

                if (totalJoined === boostCount) { // boost takviye sınırı bitmişse
                    console.log("İşlem bitti");
                    clearInterval(intervalId);
                    boostgondermeanlik = true;
                    totalJoined = -1;
                    savedServers.shift();
                    database.set('servers', savedServers);
                    return; // Bu noktada fonksiyonu sonlandırarak geri kalan işlemleri yapmaz.
                }

                const randomProxy = proxies[Math.floor(Math.random() * proxies.length)]?.replace("\r", "")?.replace("\n", "");
                var client;

                if (config.useProxies) {
                    var agent = HttpsProxyAgent(randomProxy);
                    client = config.captcha_api_key ? new Client({ captchaService: config.captcha_service.toLowerCase(), captchaKey: config.captcha_api_key, checkUpdate: false, http: { agent: agent }, captchaWithProxy: true, proxy: randomProxy, restRequestTimeout: 60 * 1000, interactionTimeout: 60 * 1000, restWsBridgeTimeout: 5 * 1000, }) : new Client({ checkUpdate: false });
                } else {
                    client = config.captcha_api_key ? new Client({ captchaService: config.captcha_service.toLowerCase(), captchaKey: config.captcha_api_key, checkUpdate: false, }) : new Client({ checkUpdate: false });
                }

                client.on("ready", async () => {
                    console.log(`[INFO] | Login token process success - ${client.user.tag}`);

                    await client.fetchInvite(inviteCode)
                        .then(async (invite) => {
                            await invite.acceptInvite(true)
                                .then(async () => {
                                    console.log(`[INFO] | Joined server process success - ${client.user.tag}`);

                                    if (client.token === tokens[tokens.length - 1]) {
                                        console.log("[INFO] | Joined - " + totalJoined);
                                        process.title = `Joined: ${totalJoined}`;
                                    }

                                    if (config.boost.enabled) {
                                        setTimeout(async () => {
                                            const allBoosts = await client.billing.fetchGuildBoosts();
                                            allBoosts.each(async (boost) => {
                                                await boost.unsubscribe().catch((err) => { });
                                                setTimeout(async () => {
                                                    await boost.subscribe(savedServersID[0]);
                                                    console.log(`[INFO] | Server boost process success - ${client.user.tag}`);
                                                }, 500);
                                            });
                                        }, config.boost.delay);
                                    }
                                })
                                .catch((err) => {
                                    console.log(`[ERROR] | Join server process fail - ${client.user.tag}`);
                                    process.title = `Joined: ${totalJoined}`;
                                    console.error(err);
                                });
                        })
                        .catch((err) => {
                            if (err.toString().includes("Unknown Invite"))
                                return console.log(`[ERROR] | Unknown Invite - ${inviteCode}`);
                            console.error(err);
                        });
                });

                try {
                    await client.login(token);
                } catch {
                    console.log(`[ERROR] | Invalid Token - ` + token);
                }
            }
        }
    }
}, 10 * 1000);



client.login(bottoken); // ana bot tokeni

process.on('unhandledRejection', err => {
    console.log(err);
});