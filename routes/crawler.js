const express = require('express')
const puppeteer = require('puppeteer')
const router = express.Router()
const fs = require('fs')
const { downloadFileFromLink } = require('../utils/downloadFile')
/**
 * Tải ảnh instagram
 */
router.get('/download/image/instagram/:username', (req, res) => {
    ;(async () => {
        const { username } = req.params
        if (!username) {
            return response.json({
                status: 100,
            })
        }
        // Setting
        const LOGIN_USERNAME = 'roniejisa'
        const LOGIN_PASSWORD = 'Dllccbmdmki@#2408'

        // Launch the browser and open a new blank page
        const browser = await puppeteer.launch({
            headless: false,
            timeout: 9999999,
            executablePath:
                'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
            args: ['--fast-start', '--disable-extensions', '--no-sandbox'],
            ignoreHTTPSErrors: true,
        })
        const page = await browser.newPage()

        // Navigate the page to a URL
        await page.goto(
            `https://www.instagram.com/accounts/login/?next=%2F${username}%2F&source=desktop_nav`,
            {
                waitUntil: 'networkidle0',
            }
        )

        // Set screen size
        await page.setViewport({ width: 1920, height: 1080 })

        // // Type into search box
        await page.type('[name="username"]', LOGIN_USERNAME)
        await page.type('[name="password"]', LOGIN_PASSWORD)
        await page.click('[type="submit"]')
        await page.waitForNavigation({ waitUntil: 'networkidle2' })

        let notNow = (await page.$('div[tabindex="0"]')) || ''
        if (notNow) {
            await page.click('div[tabindex="0"]')
            await page.waitForNavigation({ waitUntil: 'networkidle2' })
        }

        // Đầu tiên cần đặt scrollHeight vào chỗ này để kiểm tra xem hết chưa

        let scrollHeight = 0
        let newScrollHeight = 0
        let path = process.cwd() + '/public/download/' + username
        // Kiểm tra dir
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path)
        }
        getImages(newScrollHeight)
        async function getImages(oldScroll) {
            scrollHeight = oldScroll
            const imageUrls = await page.$$eval(
                '[role="tablist"] + div div img',
                (imgEls) => {
                    return imgEls.map((img) => {
                        return img.getAttribute('src')
                    })
                }
            )

            newScrollHeight = await page.evaluate(async () => {
                newScrollHeight = document.body.scrollHeight
                window.scrollBy(0, newScrollHeight)
                return newScrollHeight
            })

            let count = 0
            await new Promise((resolve) => {
                for (const imageUrl of imageUrls) {
                    let nameFile = imageUrl.slice(0, imageUrl.indexOf('?'))
                    nameFile = nameFile.slice(nameFile.lastIndexOf('/'))
                    downloadFileFromLink(imageUrl, path + nameFile, () => {
                        count++
                        if (count === imageUrls.length) {
                            resolve(true)
                        }
                    })
                }
            })
            newScrollHeight = await page.evaluate(async () => {
                newScrollHeight = document.body.scrollHeight
                window.scrollBy(0, newScrollHeight)
                return newScrollHeight
            })
            setTimeout(() => {
                if (scrollHeight != newScrollHeight) {
                    getImages(newScrollHeight)
                } else {
                    res.json({
                        status: 'Ok',
                    })
                }
            }, 2000)
        }
        // // Wait and click on first result
        // const searchResultSelector = '.devsite-result-item-link'
        // await page.waitForSelector()
        // await page.click(searchResultSelector)

        // // Locate the full title with a unique string
        // const textSelector = await page.waitForSelector(
        //     'text/Customize and automate'
        // )
        // const fullTitle = await textSelector?.evaluate((el) => el.textContent)

        // // Print the full title
        // console.log('The title of this blog post is "%s".', fullTitle)

        // await browser.close()
    })()
})

router.get("/doc-bao/:domain",(req,res) => {
    
})

module.exports = router
