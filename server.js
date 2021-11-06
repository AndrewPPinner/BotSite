const puppeteer = require('puppeteer')
const fs = require('fs-extra')
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
require('dotenv').config()
const { auth, requiresAuth, claimEquals } = require('express-openid-connect');
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');
const jwtAuthz = require('express-jwt-authz')
const JwksRsa = require('jwks-rsa')
const checkUseBot = jwtAuthz(['Use:bot'], {customScopeKey:'permissions'})
const authToken = jwt({
    secret: JwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: process.env.ISSUER_BASE_URL + ".well-known/jwks.json",
    }),
    audience: process.env.AUD,
    issuer: process.env.ISSUER_BASE_URL,
    algorithms: ['RS256']
});

// static welcome page no sign up required
app.use('/', express.static('welcome'))


;(async () => {
    app.use(
        auth({
          authorizationParams: {
              response_type: 'code',
              audience: process.env.AUD,
              scope: 'openid profile email',
            },
          auth0Logout: true,
          issuerBaseURL: process.env.ISSUER_BASE_URL,
          baseURL: process.env.BASE_URL,
          clientID: process.env.CLIENT_ID,
          secret: process.env.SECRET,
          clientSecret: process.env.CLIENT_SECRET
        })
      );


      //static sites that require the user to be logged in
    app.use('/guide' , requiresAuth(), express.static('guide'))
    app.use('/settings', requiresAuth(), express.static('settings'))
    app.use('/setup', requiresAuth(), express.static('botStatic'))

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


    app.use('/profile', requiresAuth(), express.static('profileStatic'))
 
    //calling puppeteer logic function passing information through the heading
    app.get('/bot/user/:userID/:userPass/*', authToken, checkUseBot, async (request, response) => {
        const username = request.params.userID
        const pass = request.params.userPass
        const url = request.params[0]
        const content = await bot (username, pass, url)
        response.send(content)
    })

    app.listen(port, () => {
        console.log(`Server listening on port https://quickbots.herokuapp.com/${port}`)
    })

    // puppeteer bot logic
    const bot = async (username, pass, url) => {
            const browser = await puppeteer.launch({args: ['--no-sandbox'], headless: false })
            const page = await browser.newPage()
            const complete = ''
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36')
            
            //the Url of the card you want the bot to buy
            await page.goto(url, {timeout: 20000})
            try {
                await page.waitForSelector('#cart', {timeout: 7500})
                await page.click("#cart", {clickCount: 4})
                try {
                    await page.waitForSelector('.success', {timeout: 10000})
                    await page.goto('https://www.bestbuy.com/cart')
                    await page.screenshot({path: 'example.png'})
                    await page.waitForSelector('button[data-track="Checkout - Top"]')
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
        
        return(__filename + 'example.png')
        
        
    
    }

})()