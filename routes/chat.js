const express = require('express');
const router = express.Router();
const https = require('https');
const fetch = require('node-fetch');
const Buffer = require('buffer').Buffer 
const fs = require('fs');
const GIFEncoder = require('gif-encoder-2')
const { createCanvas, Image } = require('canvas')
const { writeFile } = require('fs')
const path = require('path')

router.get('/download-image-facebook', (req, res) => {
    // let getLinkEmoji = Array.from(document.querySelectorAll('.uiGrid._51mz._5f0n ._5r8i')).map(item => item.style.backgroundImage)
    // var a = document.querySelectorAll("[class='html-div xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x193iq5w x1n2onr6 x1vjfegm']")
    // b = Array.from(a).map(b => b.querySelector('div').style.backgroundImage)

    const images = [
        "blob:https://www.messenger.com/0505848e-8934-48d8-83aa-365f1105d356",
        "blob:https://www.messenger.com/46cfa237-98b3-411b-a488-804503a06384",
        "blob:https://www.messenger.com/8f03fac0-3107-420f-af61-9f275a6f96a4",
        "blob:https://www.messenger.com/0b35b197-43ba-4738-becb-16f1c4e89e9b",
        "blob:https://www.messenger.com/fd286d47-cfe3-46e3-bfb3-d64d252f06ec",
        "blob:https://www.messenger.com/4553cbf0-6b42-4be8-bf14-29c2f6242d8e",
        "blob:https://www.messenger.com/60beeb97-c147-4725-a93f-ca972269461f",
        "blob:https://www.messenger.com/0ef3f062-334d-43b3-a200-65b001f2c483",
        "blob:https://www.messenger.com/b3f7b8dc-d6a7-4ee2-a7a4-f6c81433fd28",
        "blob:https://www.messenger.com/d139bcc9-7d5e-4b58-a4f8-83c657a8651f",
        "blob:https://www.messenger.com/8f027306-8818-44b6-9b4a-626103a5b48c",
        "blob:https://www.messenger.com/8d819317-8057-4348-9b09-0316fc3757cc",
        "blob:https://www.messenger.com/a8a29fbc-3649-4107-a8c4-8076ef536cfc",
        "blob:https://www.messenger.com/5e7d13d4-4f7e-4118-a51f-bae212e1ca27",
        "blob:https://www.messenger.com/5a46f321-9684-4ee2-839e-c2be9cae182c",
        "blob:https://www.messenger.com/ef5b975a-1538-483d-ba5b-78988793011a",
        "blob:https://www.messenger.com/47745190-1c41-44c7-b1f5-b6136736c862",
        "blob:https://www.messenger.com/ab6b6373-c26e-497a-9e11-581d499a93d2",
        "blob:https://www.messenger.com/481e7127-115b-4896-bc89-8ca710bdb5be",
        "blob:https://www.messenger.com/df25d867-dce3-4018-ae99-429cf3098f6a",
        "blob:https://www.messenger.com/e7b50cde-0455-4c4c-a98b-466b176a6377",
        "blob:https://www.messenger.com/45045426-0fe6-49f9-9d09-41db5dee6284",
        "blob:https://www.messenger.com/c5ffb843-89bf-4403-aff6-2331ab6be9a0",
        "blob:https://www.messenger.com/9ec678d1-4e6f-4f27-9848-2f01aa9b549f",
    ]

    let path = process.cwd() + '/public/images/emoji/three/';
    fetch("blob:https://www.messenger.com/0505848e-8934-48d8-83aa-365f1105d356", {
        "headers": {},
        "method": "GET"
    }).then(function (resp) {
        return resp.blob();
    }).then(async (blob) => {
        response.pipe(file);
        var buffer = await blob.arrayBuffer();
        buffer = Buffer.from(buffer);
        fs.createWriteStream(path + `test.webp`).write(buffer);
    })
    // for (let i = 0; i < images.length; i++) {

    // }
})

router.get('/edit-image-to-gif', (req, res) => {
    const { widthOne, heightOne, arrayPosition } = frameCanvas(4, 5, 394, 315, 5);
    const canvas = createCanvas(widthOne, heightOne);
    const ctx = canvas.getContext('2d')
    ctx.globalCompositeOperation = "screen";
    const encoder = new GIFEncoder(widthOne, heightOne, 'neuquant', true);
    encoder.setDelay(99);
    encoder.setQuality(60);
    encoder.setThreshold(100);
    encoder.setPaletteSize(7);
    encoder.setTransparent("0x52ff5d");
    encoder.start()
    const image = new Image();
    image.src = path.join(process.cwd(), 'public/images/emoji/first/3.png')
    for (let i = 0; i < arrayPosition.length; i++) {
        drawBackground(image, arrayPosition[i].sx, arrayPosition[i].sy, arrayPosition[i].dx, arrayPosition[i].dy)
    }
    function frameCanvas(totalRow, totalColumn, widthImage, heightImage, countLeftInTotalRow) {
        const widthOne = widthImage / totalColumn;
        const heightOne = heightImage / totalRow;
        let leftE = 0;
        let topE = 0;
        let countLeft = 0;
        let countTop = 0;
        let arrayPosition = [];
        while (true) {
            if (countLeft === totalColumn || (countLeft === countLeftInTotalRow && countTop === totalRow - 1)) {
                countLeft = 0;
                countTop++;
            }
            if (countTop === totalRow) {
                countTop = 0;
                break;
            }
            //
            arrayPosition.push({
                sx: leftE,
                sy: topE,
            })

            // Cần tính thêm tọa độ lúc cuối
            leftE = countLeft * +widthOne;
            topE = countTop * +heightOne;
            countLeft++;
        }
        return {
            widthOne, heightOne, arrayPosition
        };
    }


    function drawBackground(image, sx, sy) {
        ctx.clearRect(0, 0, widthOne, heightOne);
        ctx.save();
        ctx.drawImage(image, sx, sy, widthOne, heightOne, 0, 0, widthOne, heightOne);
        encoder.addFrame(ctx)
    }
    encoder.finish()
    const buffer = encoder.out.getData()
    writeFile(path.join(process.cwd(), 'public', 'images', 'emoji', 'gif', 'beginner.gif'), buffer, error => {
        console.log(error)
    })
    return true;
});
module.exports = router;