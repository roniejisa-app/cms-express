const express = require('express');
const router = express.Router();
const https = require('https');
const fs = require('fs');
const GIFEncoder = require('gif-encoder-2')
// const { createCanvas, Image } = require('canvas')
// const { writeFile } = require('fs')
const path = require('path')

router.get('/download-image-facebook', (req, res) => {
    // let getLinkEmoji = Array.from(document.querySelectorAll('.uiGrid._51mz._5f0n ._5r8i')).map(item => item.style.backgroundImage)

    const images = [
        "https://scontent.fhan2-3.fna.fbcdn.net/v/t39.1997-6/41497498_1926230664082594_7442829246206050304_n.png?stp=dst-png_s851x315&_nc_cat=111&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=jm9PslmP8OEAb6ZNlWE&_nc_oc=AdjV5zbYp6_tr7bGQ5EeDm7SHZWIBolE8NxEd8qFLfSEQPsPGqB4kX1yZlq3LVIZmUE&_nc_ht=scontent.fhan2-3.fna&oh=00_AfDzx9jDkGYRk8a73URfTL_oRmJ_q1lhv3bi2hye63nBlA&oe=66289B91",
        "https://scontent.fhan2-3.fna.fbcdn.net/v/t39.1997-6/41632462_1926230944082566_2768751633734041600_n.png?stp=dst-png_s851x315&_nc_cat=111&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=pBO-7iCTdWkAb5hcHOT&_nc_ht=scontent.fhan2-3.fna&oh=00_AfAOUWvOaRvdJcdsKRpwFMQWk6YIhoLj2jwhXc09hv3wcA&oe=662886D0",
        "https://scontent.fhan2-5.fna.fbcdn.net/v/t39.1997-6/41599411_1926231224082538_4675004101342265344_n.png?stp=dst-png_s851x315&_nc_cat=109&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=M0dw9Y9U1BkAb5PiirE&_nc_ht=scontent.fhan2-5.fna&oh=00_AfBWFUTPS13ju9L-T9U9iZ_HOD5IdLqwO_0hlLgnqkK4lQ&oe=66289FEA",
        "https://scontent.fhan2-4.fna.fbcdn.net/v/t39.1997-6/41590259_1926231777415816_2025843469733330944_n.png?stp=dst-png_s851x315&_nc_cat=105&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=w3-Vx6rx_nUAb4sOTB9&_nc_ht=scontent.fhan2-4.fna&oh=00_AfA2beOYzIxUvKhzxsmD8rS7bYrZUpjYz1331CesdCyLrA&oe=66288BF2",
        "https://scontent.fhan20-1.fna.fbcdn.net/v/t39.1997-6/41539937_1926232104082450_8878663098458701824_n.png?stp=dst-png_s851x315&_nc_cat=102&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=d-uXgh6QAywAb4-4qVq&_nc_ht=scontent.fhan20-1.fna&oh=00_AfAL_7_DepmEc6GjkOEZu3SWVeXnOgpSBLfCr9YeobA6xw&oe=6628806C",
        "https://scontent.fhan2-5.fna.fbcdn.net/v/t39.1997-6/41480043_1926234670748860_6450111692482281472_n.png?stp=dst-png_s851x315&_nc_cat=109&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=xF8lmCD6tSMAb5PSU-f&_nc_oc=AdgW647mcvULe6JEMqF9JDSl5MV4att0oxRG64K5FkdSQrXgD2WgM-RqtenAZAReJP8&_nc_ht=scontent.fhan2-5.fna&oh=00_AfDClMmQPgPnYaoHdSI71KJdD2OkAjSa7A-I9CklM-7Sig&oe=66288CE9",
        "https://scontent.fhan20-1.fna.fbcdn.net/v/t39.1997-6/41449440_1926234930748834_7056331173668061184_n.png?stp=dst-png_s851x315&_nc_cat=104&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=jYd8k4XU_20Ab5e1B-6&_nc_ht=scontent.fhan20-1.fna&oh=00_AfC1V7m9QAD68Msz12t929AVmzCYRHh5YWDi6MtX6IoglA&oe=66289B24",
        "https://scontent.fhan20-1.fna.fbcdn.net/v/t39.1997-6/41531799_1926235247415469_1074072235834081280_n.png?stp=dst-png_s851x315&_nc_cat=102&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=oSB6_eo0DBgAb6BZPPp&_nc_ht=scontent.fhan20-1.fna&oh=00_AfDlWmiYC-Rn0FlFagc-5FhnoxscIMEFE2PENXKpuqbQaA&oe=66288A34",
        "https://scontent.fhan20-1.fna.fbcdn.net/v/t39.1997-6/41585010_1926235960748731_6895387406078312448_n.png?stp=dst-png_s851x315&_nc_cat=102&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=HrrHytuwrFIAb4y0tKm&_nc_ht=scontent.fhan20-1.fna&oh=00_AfDvvuCp8KRFv4XbV9BFexHae26DhskEZQNTrgFGZXPJvw&oe=66286E59",
        "https://scontent.fhan2-3.fna.fbcdn.net/v/t39.1997-6/41559516_1926236407415353_8747037619445039104_n.png?stp=dst-png_s851x315&_nc_cat=111&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=q70MVbq8gJsAb6GOxz_&_nc_ht=scontent.fhan2-3.fna&oh=00_AfAKeQ_lg3eew06_jG9137xuK2gCkHG-7wix26_nwvKVVw&oe=66288984",
        "https://scontent.fhan2-4.fna.fbcdn.net/v/t39.1997-6/41490871_1926236800748647_7431763443356532736_n.png?stp=dst-png_s851x315&_nc_cat=105&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=oIeHKMCH3FYAb6Nxp47&_nc_ht=scontent.fhan2-4.fna&oh=00_AfAnC2vScc72sytMLXltMwbK9uxYk_kNJR4wOtHO8bgiAA&oe=66288345",
        "https://scontent.fhan2-5.fna.fbcdn.net/v/t39.1997-6/41572826_1926237210748606_3879416423994359808_n.png?stp=dst-png_s851x315&_nc_cat=109&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=6heS7bnKkmAAb40MX1x&_nc_ht=scontent.fhan2-5.fna&oh=00_AfC91Lsc-Fz-iJI8HcV2E3gr6UfpVLD8GGdhnhPpfA-rRQ&oe=662878A8",
        "https://scontent.fhan2-4.fna.fbcdn.net/v/t39.1997-6/41687210_1926237577415236_7348190530896920576_n.png?stp=dst-png_s851x315&_nc_cat=100&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=quiSbvh1HssAb4rgvJ0&_nc_ht=scontent.fhan2-4.fna&oh=00_AfA9RlDjPBcuc26md2AlGyoPDofYFXrxijM_Xf9PnvE4AA&oe=66287B8D",
        "https://scontent.fhan2-4.fna.fbcdn.net/v/t39.1997-6/41606050_1926237894081871_5104148519069941760_n.png?stp=dst-png_s851x315&_nc_cat=100&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=wfYYnUrN_BsAb5QjEv0&_nc_ht=scontent.fhan2-4.fna&oh=00_AfAgL_YzZKdVvJClNr-8O05iCaEmZH_fnM5HF9z2mSDXeg&oe=66287083",
        "https://scontent.fhan20-1.fna.fbcdn.net/v/t39.1997-6/41645343_1926238430748484_2479092871718764544_n.png?stp=dst-png_s851x315&_nc_cat=102&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=H8PYZTk6vDQAb4nsboh&_nc_ht=scontent.fhan20-1.fna&oh=00_AfAH00XatlIE4uSGqeL2G0Ke86Bs2sqDns2CJI5sEs1DHQ&oe=6628A597",
        "https://scontent.fhan20-1.fna.fbcdn.net/v/t39.1997-6/41461140_1926238797415114_4121059891181780992_n.png?stp=dst-png_s851x315&_nc_cat=104&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=1pGa4TqHB7MAb58fkml&_nc_ht=scontent.fhan20-1.fna&oh=00_AfAWnPVe9NIvUaalkMQTrIsMoZ7JezbiS_QDL6XxIx01fA&oe=66288A94",
        "https://scontent.fhan2-5.fna.fbcdn.net/v/t39.1997-6/41694548_1926239104081750_3174187630124335104_n.png?stp=dst-png_s851x315&_nc_cat=107&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=rUWv_rbFlk8Ab49pQmY&_nc_ht=scontent.fhan2-5.fna&oh=00_AfB8CrJ2b776BkQUxQKyY1bgLkKkrmPuqpjuQh-kt_d0aA&oe=66287D58",
        "https://scontent.fhan2-3.fna.fbcdn.net/v/t39.1997-6/41666997_1926239327415061_6482341427719176192_n.png?stp=dst-png_s851x315&_nc_cat=108&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=HWd6WqiCKm8Ab7MKp_-&_nc_ht=scontent.fhan2-3.fna&oh=00_AfDlPfdS65b6FOfTw7LiD7le4XKZZQ_0D9IikIvITUwW5g&oe=66288616",
        "https://scontent.fhan2-5.fna.fbcdn.net/v/t39.1997-6/41497478_1926239687415025_784143247361441792_n.png?stp=dst-png_s851x315&_nc_cat=106&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=hadYOaYHq30Ab6BlahE&_nc_ht=scontent.fhan2-5.fna&oh=00_AfB3nsjJRboYq7NK85M73hKTriWjEaJpsVwu7merRtoR8g&oe=66289754",
        "https://scontent.fhan2-3.fna.fbcdn.net/v/t39.1997-6/41696851_1926240314081629_3774585235895746560_n.png?stp=dst-png_s851x315&_nc_cat=101&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=EcmdUCiA_LwAb7lW5sF&_nc_ht=scontent.fhan2-3.fna&oh=00_AfBUKHtLZ8HLzj7Re0N7BjfP3lGNIyhWZxxO1JlMgHR0dw&oe=66289974",
        "https://scontent.fhan2-4.fna.fbcdn.net/v/t39.1997-6/41714284_1926240637414930_6546602646797549568_n.png?stp=dst-png_s851x315&_nc_cat=110&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=eL2Vbs0qmzUAb6x-FTd&_nc_ht=scontent.fhan2-4.fna&oh=00_AfAa381f5cAEYIDd_u216r18pJwuzCrTOTB5Yr8jUK41Iw&oe=66286EC6",
        "https://scontent.fhan2-4.fna.fbcdn.net/v/t39.1997-6/41550608_1926241050748222_1349520883802177536_n.png?stp=dst-png_s851x315&_nc_cat=105&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=bksyiusVvp8Ab6WMmO8&_nc_ht=scontent.fhan2-4.fna&oh=00_AfC1Fen05mHut9yrkcmbJ_IlmH6h4CaNEETsFvxqi6iRYw&oe=66289538",
        "https://scontent.fhan2-5.fna.fbcdn.net/v/t39.1997-6/41642508_1926241337414860_3440311264142688256_n.png?stp=dst-png_s851x315&_nc_cat=106&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=OJXCHEC78tcAb72oLVJ&_nc_ht=scontent.fhan2-5.fna&oh=00_AfDhJl9191mqP6MYop2dsX9_OEqrRTEk3jrkiXBHUYA56Q&oe=6628A070",
        "https://scontent.fhan20-1.fna.fbcdn.net/v/t39.1997-6/41579705_1926241740748153_8452243747286024192_n.png?stp=dst-png_s851x315&_nc_cat=102&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=Yv276cHdhRoAb75SSEo&_nc_ht=scontent.fhan20-1.fna&oh=00_AfCpsk9AA8evstNAqhlDdORUG2rz8UPyo5EOxxi4V1_NoA&oe=66288C95",
    ];

    let path = process.cwd() + '/public/images/emoji/three/';
    for (let i = 0; i < images.length; i++) {
        let file = fs.createWriteStream(path + `${i + 1}.png`);
        https.get(images[i], function (response) {
            response.pipe(file);
            file.on('finish', function () {
                file.close(console.log("OK"));
            }).on('error', function (err) {
                fs.unlink(dest); // Delete the file async if there is an error
                console.log("ERROR");
            });
        })
    }
    return res.json({
        status: 200
    })
})

// router.get('/edit-image-to-gif', (req, res) => {
//     const { widthOne, heightOne, arrayPosition } = frameCanvas(4, 5, 394, 315, 5);
//     const canvas = createCanvas(widthOne, heightOne);
//     const ctx = canvas.getContext('2d')
//     ctx.globalCompositeOperation = "screen";
//     const encoder = new GIFEncoder(widthOne, heightOne, 'neuquant', true);
//     encoder.setDelay(99);
//     encoder.setQuality(60);
//     encoder.setThreshold(100);
//     encoder.setPaletteSize(7);
//     encoder.setTransparent("0x52ff5d");
//     encoder.start()
//     const image = new Image();
//     image.src = path.join(process.cwd(), 'public/images/emoji/first/3.png')
//     for (let i = 0; i < arrayPosition.length; i++) {
//         drawBackground(image, arrayPosition[i].sx, arrayPosition[i].sy, arrayPosition[i].dx, arrayPosition[i].dy)
//     }
//     function frameCanvas(totalRow, totalColumn, widthImage, heightImage, countLeftInTotalRow) {
//         const widthOne = widthImage / totalColumn;
//         const heightOne = heightImage / totalRow;
//         let leftE = 0;
//         let topE = 0;
//         let countLeft = 0;
//         let countTop = 0;
//         let arrayPosition = [];
//         while (true) {
//             if (countLeft === totalColumn || (countLeft === countLeftInTotalRow && countTop === totalRow - 1)) {
//                 countLeft = 0;
//                 countTop++;
//             }
//             if (countTop === totalRow) {
//                 countTop = 0;
//                 break;
//             }
//             //
//             arrayPosition.push({
//                 sx: leftE,
//                 sy: topE,
//             })

//             // Cần tính thêm tọa độ lúc cuối
//             leftE = countLeft * +widthOne;
//             topE = countTop * +heightOne;
//             countLeft++;
//         }
//         return {
//             widthOne, heightOne, arrayPosition
//         };
//     }


//     function drawBackground(image, sx, sy) {
//         ctx.clearRect(0, 0, widthOne, heightOne);
//         ctx.save();
//         ctx.drawImage(image, sx, sy, widthOne, heightOne, 0, 0, widthOne, heightOne);
//         encoder.addFrame(ctx)
//     }
//     encoder.finish()
//     const buffer = encoder.out.getData()
//     writeFile(path.join(process.cwd(), 'public', 'images', 'emoji', 'gif', 'beginner.gif'), buffer, error => {
//         console.log(error)
//     })
//     return true;
// });
module.exports = router;