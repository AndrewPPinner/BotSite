const puppeteer = require('puppeteer')
const cheerio = require('cheerio')
const axios = require('axios')
const fs = require('fs-extra')
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const userAgent = require('user-agents')
require('dotenv').config()
const hour = 60 * 60 * 1000
const { auth, requiresAuth, claimEquals } = require('express-openid-connect');
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');
const jwtAuthz = require('express-jwt-authz')
const JwksRsa = require('jwks-rsa')
const { response } = require('express')
const checkUseBot = jwtAuthz(['Use:bot'], {customScopeKey:'permissions'})
const authToken = jwt({
    secret: JwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: "https://dev-2zwfghb6.us.auth0.com/.well-known/jwks.json",
    }),
    audience: "https://test/api",
    issuer: "https://dev-2zwfghb6.us.auth0.com/",
    algorithms: ['RS256']
});

// static welcome page no sign up required
app.use('/', express.static('welcome'))
app.use('/news', express.static('news'))


;(async () => {
    app.use(
        auth({
          authorizationParams: {
              response_type: 'code',
              audience: "https://test/api",
              scope: 'openid profile email',
            },
          auth0Logout: true,
          issuerBaseURL: "https://dev-2zwfghb6.us.auth0.com/",
          baseURL: "https://gpubots.asuscomm.com/",
          clientID: "j80RvDBseJ3tlus9UR1B21EjYn6KnV9y",
          secret: "feiTKHNEuXKjzvObtGOyccAICZOZKBHh",
          clientSecret: "Ttr9gZjdkLOp8vNwDzikbdjVwpBnPvQKjq7YX_rnVMzPPl5XX4RzoJNhlQ-9ZhzQ"
        })
      );
      const data = []

      setInterval(function () {
          data.pop()
        axios
        .get('https://www.bestbuy.com/site/searchpage.jsp?id=pcat17071&qp=category_facet%3Dname~abcat0507002%5Egpusv_facet%3DGraphics%20Processing%20Unit%20(GPU)~NVIDIA%20GeForce%20RTX%203060%5Egpusv_facet%3DGraphics%20Processing%20Unit%20(GPU)~NVIDIA%20GeForce%20RTX%203060%20Ti%5Egpusv_facet%3DGraphics%20Processing%20Unit%20(GPU)~NVIDIA%20GeForce%20RTX%203070%5Egpusv_facet%3DGraphics%20Processing%20Unit%20(GPU)~NVIDIA%20GeForce%20RTX%203070%20Ti%5Egpusv_facet%3DGraphics%20Processing%20Unit%20(GPU)~NVIDIA%20GeForce%20RTX%203080%5Egpusv_facet%3DGraphics%20Processing%20Unit%20(GPU)~NVIDIA%20GeForce%20RTX%203080%20Ti%5Egpusv_facet%3DGraphics%20Processing%20Unit%20(GPU)~NVIDIA%20GeForce%20RTX%203090&st=nvidia+graphics')
        .then(response => {
            const base = response.data
            const scrape = cheerio.load(base)
            scrape(".sku-item-list", base).each(function() {
                const card = scrape(this).find('.sku-header').find('a').text()
                const price = '$' + scrape(this).find('.pricing-price').find('span[aria-hidden]').text()
                data.push({
                    card,
                    price
                })
            })
            console.log('ready')
        })
      },60000)


      //static sites that require the user to be logged in
    app.use('/guide' , requiresAuth(), express.static('guide'))
    app.use('/settings', requiresAuth(), express.static('settings'))
    app.use('/setup', requiresAuth(), express.static('botStatic'))
    app.use('/profile', requiresAuth(), express.static('profileStatic'))

    //check if the user is logged in to display useable endpoints
    app.get('/loggedin', (req, res) => {
        res.send('Logged in')})

    // get access token on login to make request to autherized endpoints
    app.get('/profile/ID', requiresAuth(), (req, res) => {
        let { access_token } = req.oidc.accessToken;
        res.send(access_token)
    })

    //testing and should remove in the future
    app.get('/profile/info', requiresAuth(), (req, res) => {
        res.send(req.oidc.idTokenClaims)        
    })

 
    //calling puppeteer logic function passing information through the heading
    app.get('/bot/user/:userID/:userPass/*', authToken, checkUseBot, async (request, response) => {
        const username = request.params.userID
        const pass = request.params.userPass
        const url = request.params[0]
        console.log(url + " " + username + " " + pass)
        const content = await bot (username, pass, url)
        response.send(content)
    })

    app.get('/stock', authToken, async (req, res) => {
        res.send(data)

    })

    app.listen(port, () => {
        console.log(`Server listening on https://gpubots.asuscomm.com/`)
    })

    // puppeteer bot logic
    const bot = async (username, pass, url) => {
            const browser = await puppeteer.launch({args: ['--no-sandbox', "--disable-setuid-sandbox"], headless: false})
            const page = await browser.newPage()
            const complete = ''
            //await page.setUserAgent(userAgent.toString())
            
            //the Url of the card you want the bot to buy
            await page.goto(url, {timeout: 20000, waitUntil: 'domcontentloaded'})
            try {
                await page.waitForSelector('#cart', {timeout: 7500})
                await page.click("#cart", {clickCount: 4})
                try {
                    await page.waitForSelector('.success', {timeout: 10000})
                    await page.screenshot({path: 'example.png'})
                    await page.goto('https://www.bestbuy.com/cart')
                    await page.waitForSelector('button[data-track="Checkout - Top"]')
                    await page.screenshot({path: 'example.png'})
                    await page.click('button[data-track="Checkout - Top"]', {clickCount: 4})
                    await page.waitForSelector("#fld-e")
                    await page.type("#fld-e", username) 
                    await page.type('#fld-p1', pass)
                    await page.click('.cia-form__controls ')
                    await page.waitForSelector('button[data-track="Place your Order - Contact Card"]')
                    await page.screenshot({path: 'example.png'})
                }
                catch(e) {
                    try {
                        await page.screenshot({path: 'example.png'})
                        await page.waitForSelector('#gated-purchase-please-wait-button', {timeout: 5500})
                        await page.screenshot({path: 'example.png'})
                        const value = await page.$eval('button[disabled]', el => getComputedStyle(el).getPropertyValue('cursor'))
                        await setInterval( async function(){
                            if (value == "not-allowed") {
                            }
                            else {
                                await page.click('#gated-purchase-please-wait-button')
                                await page.waitForSelector("#fld-e")
                                await page.type("#fld-e", username)
                                await page.type('#fld-p1', pass) 
                                await page.click('.cia-form__controls ')
                                await page.waitForSelector('button[data-track="Place your Order - Contact Card"]')
                                await page.screenshot({path: 'example.png'})
                            }
                          },7500)

                    }
                catch(e) {
                    console.log(e)
                    await browser.close()
                    await bot (username, pass, url)
                }
            }
                //await page.click('.payment__order-summary')
            } catch(e) {
            await page.screenshot({path: 'example.png'})
            console.log("there was an error")
            console.log(e)
            await browser.close()
            await bot (username, pass, url)
        }
        
        return('good job')
        
        
    
    }


})()
