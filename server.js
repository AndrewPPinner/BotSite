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
    app.use('/setup', requiresAuth(), express.static('botStatic'))
    app.get('/profile/ID', requiresAuth(), (req, res) => {
        let { access_token } = req.oidc.accessToken;
        res.send(access_token)
    })
    app.get('/profile/info', requiresAuth(), (req,res) => {
        res.send(req.oidc.idTokenClaims)
    })
    app.use('/profile', requiresAuth(), express.static('profileStatic'))
 
    
    

    app.get('/bot/user/:userID/:userPass/*', authToken, checkUseBot, async (request, response) => {
        const username = request.params.userID
        const pass = request.params.userPass
        const url = request.params[0]
        const content = await bot (username, pass, url)
        response.send("success")
    })

    app.listen(port, () => {
        console.log(`Server listening on port http://localhost:${port}`)
    })


    const bot = async (username, pass, url) => {
            const browser = await puppeteer.launch({ headless: false, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" })
            const page = await browser.newPage()
            await page.setViewport({ width: 1250, height: 1300 })
            
            //the Url of the card you want the bot to buy
            await page.goto(url, {timeout: 20000})
            try {
                await page.waitForSelector('#cart', {timeout: 7500})
                await page.click("#cart", {clickCount: 4})
                await page.waitForSelector('.success', {timeout: 2500})
                await page.goto('https://www.bestbuy.com/cart')
                await page.waitForSelector('.checkout-buttons__checkout')
                await page.click('.checkout-buttons__checkout')
                await page.waitForSelector("#fld-e")
                await page.type("#fld-e", username) //enter your email between the ''
                await page.type('#fld-p1', pass) //enter your password between the ""
                await page.click('.cia-form__controls ')
                await page.waitForSelector('.payment__order-summary')
                //await page.click('.payment__order-summary')
            } catch(e) {
            console.log("there was an error")
            console.log(e)
            await browser.close()
            await bot (username, pass, url)
        }
        
        return
        
        
    
    }

})()