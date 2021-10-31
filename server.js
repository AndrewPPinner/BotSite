const puppeteer = require('puppeteer')
const fs = require('fs-extra')
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
require('dotenv').config()
const { auth, requiresAuth } = require('express-openid-connect');


app.use('/', express.static('welcome'))

app.use(
  auth({
    auth0Logout: true,
    issuerBaseURL: process.env.ISSUER_BASE_URL,
    baseURL: process.env.BASE_URL,
    clientID: process.env.CLIENT_ID,
    secret: process.env.SECRET
  })
);




;(async () => {
    app.use('/setup', requiresAuth(), express.static('botStatic'))
    app.get('/profile', requiresAuth(), (req, res) => {

        res.send(req.oidc.user)
    })

    app.get('/bot/user/:userID/:userPass/*', requiresAuth(), async (request, response) => {
        const username = request.params.userID
        const pass = request.params.userPass
        const url = request.params[0]
        const content = await bot (username, pass, url)
        response.set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Content-Type': 'text/plain'
        })

        response.send(content)
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
        
        return `{
            "test" : "hookers"
        }`
        
        
    
    }

})()