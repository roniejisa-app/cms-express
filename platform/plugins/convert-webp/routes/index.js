const express = require('express')
const router = express.Router()
// const sharp = require('sharp')
// const fs = require('fs')
// const path = require('path')
// const queueProvider = require('../../../../jobs/queue')
// const queueEmailProvider = require('../../../../jobs/queueEmail')

// const INPUT_DIR = process.cwd() + '/public/download/ngantran812'
// const OUTPUT_DIR = process.cwd() + '/public/download/ngantran812/resize'
// router.get('/convert-webp', (req, res) => {
//     // Create the output directory
//     if (!fs.existsSync(OUTPUT_DIR)) {
//         fs.mkdirSync(OUTPUT_DIR, {
//             mode: 0o755,
//         })
//     }
//     // Define a function to convert image files to WebP format
//     let imgs = []
//     const convertToWebp = (img, index) => {
//         // Define the name of the new WebP file
//         const imgName = path.parse(img).name
//         // // Use sharp to convert the image to WebP format and save it to the output directory
//         sharp(`${INPUT_DIR}/${img}`)
//             .webp({
//                 quality: 50,
//             })
//             .toFile(`${OUTPUT_DIR}/${imgName}.webp`)
//     }

//     // Read the input directory and filter for image files (PNG, JPG, JPEG)
//     fs.readdir(INPUT_DIR, (err, files) => {
//         console.log(files)
//         imgs = files.filter((file) => {
//             const ext = path.extname(INPUT_DIR + file).toLowerCase()
//             return ext === '.png' || ext === '.jpg' || ext === '.jpeg'
//         })
//         // For each image file found, call the convertToWebp function
//         imgs.forEach((img, i) => convertToWebp(img, i))
//     })
//     return res.json({
//         status: 200,
//         message: 'Hi',
//     })
// })

// router.get('/convert-webp-queue', (req, res) => {
//     queueProvider.add({
//         message: 'Hello World!',
//     })
// })

// router.get('/send-mail-test-queue', (req, res) => {
//     for(let i = 0; i < 3; i++) {
//         queueEmailProvider.add({
//             to: 'hieupm248@gmail.com',
//             subject: 'test' + i,
//             message: 'test' + i,
//         })
//     }
//     return res.json({
//         status: 200,
//         message: 'Hi',
//     })
// })
module.exports = router
