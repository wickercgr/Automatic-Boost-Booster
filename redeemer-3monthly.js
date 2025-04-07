async function redeemprocess() {

    const puppeteer = require('puppeteer')
    const fs = require('fs')
    const useProxy = require('puppeteer-page-proxy');
    const path = require("path")
    const db = require("csy.db");
    const { JsonDatabase } = require("wio.db");
    const database = new JsonDatabase({ databasePath: "./database.json" });

    const BROWSER_CONFIG = {
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-infobars',
            '--window-position=0,0',
            '--window-size=1000,700',
        ],
        defaultViewport: null,
        ignoreHTTPSErrors: true,
        headless: false,
    }

    const wait = (ms) => new Promise((res) => { setTimeout(() => { res() }, ms) });

    const oauth2 = async (browser, Page, token, nitro, proxy, card, { now, max }) => {
        return new Promise(async (res) => {
            var er = false;
            try {

                await Page.bringToFront();
                await Page.setExtraHTTPHeaders({
                    'Accept-Language': 'en-US',
                });
                await Page.goto('https://discord.com', { "waitUntil": "networkidle0", timeout: 70000 });
                await Page.evaluate('function login(token) {setInterval(() => {document.body.appendChild(document.createElement `iframe`).contentWindow.localStorage.token = `"${token}"`}, 50);setTimeout(() => {location.reload();}, 2500);}login("' + token + '")')
                await Page.goto(nitro, { "waitUntil": "networkidle0", timeout: 70000 });
                await Page.waitForSelector('button[type=button]');
                await Page.evaluate(() => Array.from(document.querySelectorAll('button[type=button]'), async (element) => {
                    if (element.textContent == "Next" || element.textContent == "Ýleri")
                        await element.click()
                }));
                await wait(1500)

                await Page.waitForFunction(
                    'document.querySelector("body").innerText.includes("Add a new payment method") || document.querySelector("body").innerText.includes("Yeni bir ödeme yöntemi ekle")',
                    {
                        timeout: 20 * 1000
                    }
                );

                await Page.evaluate(() => Array.from(document.querySelectorAll('button[type=button]'), async (element) => {
                    if (element.textContent == "Add a new payment method" || "Yeni bir ödeme yöntemi ekle")
                        await element.click()
                }));

                await Page.waitForFunction(
                    'document.querySelector("body").innerText.includes("Card") || document.querySelector("body").innerText.includes("Kart")',
                    {
                        timeout: 20 * 1000
                    }
                );

                await Page.waitForSelector('button[type=button]');
                await Page.evaluate(() => Array.from(document.querySelectorAll('button[type=button]'), async (element) => {
                    if (element.textContent.includes("Card") || element.textContent.includes("Kart"))
                        await element.click()
                }));
                await Page.waitForSelector('input[name="name"]');
                await Page.waitForSelector('iframe');
                var frames = await Page.frames();
                await wait(1000)
                var cardSp = card.split(":");
                for (var i = 0; i < frames.length; i++) {
                    var cardN = await frames[i].$('input[name="cardnumber"]');
                    var cardE = await frames[i].$('input[autocomplete="cc-exp"');
                    var cardC = await frames[i].$('input[name="cvc"]');
                    if (!cardE && cardN) {
                        await frames[i].type('input[name="cardnumber"]', `${String(cardSp[0]).replace(/\r?\n|\r/g, '')}`, { delay: 10 }).catch(err => err + "1");
                        await wait(1000);
                    } else if (cardE) {
                        await frames[i].type('input[inputmode="numeric"]', `${String(cardSp[1] + cardSp[2]).replace(/\r?\n|\r/g, '')}`, { delay: 10 }).catch(err => err + "1");
                        await wait(1000);
                    } else if (cardC) {
                        await frames[i].type('input[name="cvc"]', `${String(cardSp[3]).replace(/\r?\n|\r/g, '')}`, { delay: 10 }).catch(err => err + "1");
                        await wait(1000);
                    }
                }

                await Page.type('input[name="name"]', `eternityshop`, { delay: 10 });
                await Page.waitForSelector('button[type=submit]');
                await Page.evaluate(() => Array.from(document.querySelectorAll('button[type=submit]'), async (element) => {
                    if (element.textContent.includes("Next") || element.textContent.includes("Ýleri"))
                        await element.click()
                }));

                await Page.waitForSelector('input[name="line1"]');
                await Page.type('input[name="line1"]', `C/ Los Herrán 22`, { delay: 10 });

                await Page.waitForSelector('input[name="city"]');
                await Page.type('input[name="city"]', `Jerez De Los Caballeros`, { delay: 10 });

                //await Page.waitForSelector('input[aria-controls="uid_27"]');
                //await Page.type('input[aria-controls="uid_27"]', `Turkey`, {delay: 10});
                //await Page.keyboard.press('Enter');

                await Page.waitForSelector('input[name="state"]');
                await Page.type('input[name="state"]', `Badajoz`, { delay: 10 });

                await Page.waitForSelector('input[name="postalCode"]');
                await Page.type('input[name="postalCode"]', `06380`, { delay: 10 });

                await Page.waitForSelector('button[type=button]');
                await Page.evaluate(() => Array.from(document.querySelectorAll('button[type=button]'), async (element) => {
                    if (element.textContent.includes("Next") || element.textContent.includes("Ýleri"))
                        await element.click()
                }));

                await Page.waitForSelector('button[type=submit]');
                await Page.evaluate(() => Array.from(document.querySelectorAll('button[type=submit]'), async (element) => {
                    if (element.textContent.includes("Get Nitro Monthly") || element.textContent.includes("Aylýk Nitro al"))
                        await element.click()
                }));


                var reset1 = false;
                try {
                    await Page.waitForFunction(
                        'document.querySelector("body").innerText.includes("Baþarýsýz")',
                        {
                            timeout: 20 * 1000
                        }
                    );
                } catch (err) {
                    reset1 = true;
                }

                if (!reset1) {
                    await Page.evaluate('setTimeout(() => { location.reload(); }, 2500)');
                    let retry = await oauth2(browser, Page, token, nitro, proxy, card, { now, max })
                    res(retry);
                    return;
                }

                await Page.waitForFunction(
                    'document.querySelector("body").innerText.includes("Enjoy friend!") || document.querySelector("body").innerText.includes("Tadýný çýkar dostum!")',
                    {
                        timeout: 3 * 60 * 1000
                    }
                );

                await wait(3000);

                console.log(`${now}/${max} Passed!`);
                db.add("cardnow", 1);
                db.set(`already_${token}`, new Date().getTime());
                fs.appendFile('datas/joiner-data/process-tokens.txt', `${token}\n`, 'utf8', (error) => {
                    if (error) {
                        console.error('Dosyaya yazma hatasý:', error);
                    } else {
                        console.log(`Token "${token}" dosyaya baþarýyla eklendi.`);
                    }
                });

                res(true);
            } catch (err) {
                console.log(err);
                console.log(`${now}/${max} Using Problem!`);
                er = true;
            }
            if (er) {
                res(true);
            }
        });
    }

    const start = async (index, token, nitro, proxy, card, stat) => {
        const browser = await puppeteer.launch(BROWSER_CONFIG);
        const pageG = (await browser.pages())[0];
        pageG.close();
        const context = await browser.createIncognitoBrowserContext();
        const DiscordPage = await context.newPage();
        var proxyPar = proxy.split(":");

        //await useProxy(DiscordPage, `http://${proxyPar[2]}:${proxyPar[3]}@${proxyPar[0]}:${proxyPar[1]}`);

        await DiscordPage.goto('http://httpbin.org/ip');
        await oauth2(browser, DiscordPage, token, nitro, proxy, card, stat);
        browser.close();
    };

    const proxyChecker = async (proxy) => {
        return new Promise(async (res) => {
            var err = false;
            try {

                var proxyPar = proxy.split(":");
                const browser = await puppeteer.launch(BROWSER_CONFIG);
                const pageG = (await browser.pages())[0];
                pageG.close();
                const context = await browser.createIncognitoBrowserContext();
                const DiscordPage = await context.newPage();
                await useProxy(DiscordPage, `http://${proxyPar[2]}:${proxyPar[3]}@${proxyPar[0]}:${proxyPar[1]}`);

                await DiscordPage.goto('http://httpbin.org/ip');
                res(true);
            } catch (errr) {
                errr + "1";
                err = true;
            }
            if (err) res(false);
        });
    }


    (async () => {
        console.log("Started Nitro Take");

        var tokensFile = await fs.readFileSync(path.join(__dirname, "/datas/redeemer-data/tokens.txt"), "utf-8");
        var nitrosFile = await fs.readFileSync(path.join(__dirname, "/datas/redeemer-data/nitros.txt"), "utf-8");
        var proxiesFile = await fs.readFileSync(path.join(__dirname, "/datas/redeemer-data/proxies.txt"), "utf-8");
        var cardFile = await fs.readFileSync(path.join(__dirname, "/datas/redeemer-data/cards.txt"), "utf-8");
        var tokens = tokensFile.split("\n");
        var nitros = nitrosFile.split("\n");
        var proxies = proxiesFile.split("\n");
        var cards = cardFile.split("\n");
        console.log("Total " + database.get('boostcount') + " Started!")
        /*
        for(var ii = 0; ii < proxies.length; ii++) {
            let proxyTest = await proxyChecker(proxies[ii]);
            if(!proxyTest) {
               console.warn(ii, "Proxy Broken!");
            } else {
                console.log(ii, "working");
            }
            
        }
          return;*/
        for (var i = 0; i < database.get('boostcount'); i++) {
            var cardN = db.get("cardnow") || 0;
            var cardU = db.get("carduse") || 0;
            if (cardN >= 4) {
                cardN = 0;
                db.delete("cardnow");
                db.add("carduse", 1);
                cardU++;
            }

            var card = cards[i];
            var tkn = String(tokens[i]).replace(/\r?\n|\r/g, '');
            var nitro = String(nitros[i]).replace(/\r?\n|\r/g, '');
            var proxy = String(proxies[i]).replace(/\r?\n|\r/g, '');
            if (db.has(`already_${tkn}`)) {
                console.log(`${(i + 1)}/` + database.get('boostcount') + ' already next..');
                continue;
            }
            await start(i, tkn, nitro, proxy, card, { now: (i + 1), max: database.get('boostcount') });

            await wait(3000);
        }
        console.log("All Tokens Finished!" + database.get('boostcount'));
    })();
}

redeemprocess();