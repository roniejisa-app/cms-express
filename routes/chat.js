const express = require('express');
const router = express.Router();
const https = require('https');
const fs = require('fs');
router.get('/download-image-facebook', (req, res) => {
    const images = [
        "https://scontent.fhan20-1.fna.fbcdn.net/v/t39.1997-6/17351560_2041011399459667_2840710172941221888_n.png?stp=dst-png_s851x315&_nc_cat=103&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=1FIsGc6YVFIAb6tDNY8&_nc_ht=scontent.fhan20-1.fna&oh=00_AfBm0ME5_qubAMBS4jpnUFZBZxbvu4GxGkGE52IOGlekJQ&oe=6628626B",
        "https://scontent.fhan2-4.fna.fbcdn.net/v/t39.1997-6/17636430_2041011582792982_7473347063313334272_n.png?stp=dst-png_s851x315&_nc_cat=110&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=uZGLUTtBCi4Ab6DxHZ4&_nc_ht=scontent.fhan2-4.fna&oh=00_AfCXwa-kXwgn1Pzmg2KTHU-u9uLuw_YUp5n74r6xILDFUw&oe=66288DE5",
        "https://scontent.fhan20-1.fna.fbcdn.net/v/t39.1997-6/17634150_2041011732792967_1197758407671545856_n.png?stp=dst-png_s851x315&_nc_cat=104&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=w8AiPFYhc8QAb62u3DU&_nc_ht=scontent.fhan20-1.fna&oh=00_AfCTgwDj29Oz_XR0kcrWyRtsL-oRILj_zOWyNEtXqmJ58Q&oe=66287CA2",
        "https://scontent.fhan2-3.fna.fbcdn.net/v/t39.1997-6/17639154_2041011846126289_7183153814092906496_n.png?stp=dst-png_s851x315&_nc_cat=108&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=A3dxSgFHZ_wAb4ZGJ4T&_nc_ht=scontent.fhan2-3.fna&oh=00_AfBx6c9pUGPIuEWMJruVfWFpN_YgqjPwcgRpHyCoI-P0kg&oe=66288DC7",
        "https://scontent.fhan2-5.fna.fbcdn.net/v/t39.1997-6/17639170_2041011959459611_5884507324717989888_n.png?stp=dst-png_s851x315&_nc_cat=109&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=fhDMzve_knwAb4o7O2s&_nc_ht=scontent.fhan2-5.fna&oh=00_AfBmCvJsMUeUjsYsCYMJ0vIL0lqlZvnYkVwrGAzd2NGAbw&oe=662884C2",
        "https://scontent.fhan2-4.fna.fbcdn.net/v/t39.1997-6/17626085_2041012112792929_2963922700080250880_n.png?stp=dst-png_s851x315&_nc_cat=105&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=5VjXbfJGqv0Ab5VSdny&_nc_ht=scontent.fhan2-4.fna&oh=00_AfCAIV1gMsy7xmZYKqw8MCDeVXOT-K_5_49EnM3gAaEN6g&oe=662884CB",
        "https://scontent.fhan2-4.fna.fbcdn.net/v/t39.1997-6/17527921_2041012279459579_8183372734357569536_n.png?stp=dst-png_s851x315&_nc_cat=100&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=Cueqc0eJrpsAb7FjwvN&_nc_ht=scontent.fhan2-4.fna&oh=00_AfCgBmvlctuU6CWqGy73sk5Q-ObY-_nDhX8dtWgmUy_WcA&oe=662884F0",
        "https://scontent.fhan2-4.fna.fbcdn.net/v/t39.1997-6/17640298_2041012422792898_1598305391249195008_n.png?stp=dst-png_s851x315&_nc_cat=100&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=UxU4jmb4pyoAb5vbo4J&_nc_ht=scontent.fhan2-4.fna&oh=00_AfDrphebfyQDDxs-G5RUyJQlm-ZgC2OjQuBew0O_TMSySw&oe=66286B88",
        "https://scontent.fhan2-5.fna.fbcdn.net/v/t39.1997-6/17636676_2041012542792886_8288634596006821888_n.png?stp=dst-png_s851x315&_nc_cat=109&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=eI-DbAAmFdYAb6OkWiz&_nc_ht=scontent.fhan2-5.fna&oh=00_AfDfnevuwuo21t2kHXodnUHXRovYNDJBgqvBhIJZoZ36PQ&oe=6628839E",
        "https://scontent.fhan2-3.fna.fbcdn.net/v/t39.1997-6/17636395_2041012709459536_3748715891957694464_n.png?stp=dst-png_s851x315&_nc_cat=101&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=7nQ7iPtkjOUAb6jqp3P&_nc_ht=scontent.fhan2-3.fna&oh=00_AfBTSfhFl4g64phKVpbYFZHe5ZHJnLo7AS_Gax-3kk324Q&oe=6628826A",
        "https://scontent.fhan2-5.fna.fbcdn.net/v/t39.1997-6/17640246_2041014446126029_2627766085247565824_n.png?stp=dst-png_s851x315&_nc_cat=109&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=UaYPsAzxJrQAb6sVAOM&_nc_ht=scontent.fhan2-5.fna&oh=00_AfDZhNM-SZGufkA_jz4rvAbhkmw6pNt8kFyBd6mE2TvLBg&oe=66288218",
        "https://scontent.fhan2-5.fna.fbcdn.net/v/t39.1997-6/17636628_2041014749459332_7534184098240135168_n.png?stp=dst-png_s851x315&_nc_cat=106&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=1Z5d19AkLToAb6EYwLK&_nc_ht=scontent.fhan2-5.fna&oh=00_AfA-SZYyCfB9XVw3WWp9UBJtmRVmRqldBImSSovzZI1clw&oe=66287CBB",
        "https://scontent.fhan2-5.fna.fbcdn.net/v/t39.1997-6/17120040_2041015026125971_8365606985546072064_n.png?stp=dst-png_s851x315&_nc_cat=106&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=tkUjiobcJGQAb50BFGi&_nc_ht=scontent.fhan2-5.fna&oh=00_AfCroWl9cm6tjdPUGiANik2MUNuf_IOpEzjSweNPcdwRuw&oe=66289184",
        "https://scontent.fhan2-4.fna.fbcdn.net/v/t39.1997-6/17634214_2041015196125954_702817311467241472_n.png?stp=dst-png_s851x315&_nc_cat=105&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=V6TKjAT0Eu4Ab6sDvy8&_nc_ht=scontent.fhan2-4.fna&oh=00_AfBQFMM6iKnqztbI5LDjBtL049xnlI6Yk37QvQOGFY9poA&oe=66288E1B",
        "https://scontent.fhan2-4.fna.fbcdn.net/v/t39.1997-6/17636409_2041015336125940_679945090197618688_n.png?stp=dst-png_s851x315&_nc_cat=105&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=i6XGztd4broAb4wylux&_nc_ht=scontent.fhan2-4.fna&oh=00_AfAzmpotuvexWqe_zLnwFDZZw0JARyKYQr6Gnx-4ny5GhA&oe=66286C90",
        "https://scontent.fhan2-4.fna.fbcdn.net/v/t39.1997-6/17119990_2041015432792597_4201992880518070272_n.png?stp=dst-png_s851x315&_nc_cat=105&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=yblDP6-sBPkAb6X-xT7&_nc_ht=scontent.fhan2-4.fna&oh=00_AfA4AKRwx0zsGtB8F9KmMAi-GcNuTrPaPm4jrPhxERYiUQ&oe=66289094",
        "https://scontent.fhan2-5.fna.fbcdn.net/v/t39.1997-6/17639179_2041015579459249_5288671558330482688_n.png?stp=dst-png_s851x315&_nc_cat=106&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=liM5Rj6gHFkAb6N1eMS&_nc_ht=scontent.fhan2-5.fna&oh=00_AfALNvsAhiH0X6TuSwN3DEtcOs7wXWgQHhKgOknI_LQ8bA&oe=66286796",
        "https://scontent.fhan2-4.fna.fbcdn.net/v/t39.1997-6/17632943_2041017432792397_1028966055499792384_n.png?stp=dst-png_s851x315&_nc_cat=105&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=DIXH9czTwrsAb5Q67z_&_nc_oc=Adh_-p93RtEx8JSjbzhIDb35xJFHq8eBq3yjlgKry-RzxgVjFSj_6Htl5dr9wVAPh0Q&_nc_ht=scontent.fhan2-4.fna&oh=00_AfCp55ptPN3DFpl7dIeMAaKr3U5mKbwauKaqjAi1PHfmhg&oe=662894FC",
        "https://scontent.fhan20-1.fna.fbcdn.net/v/t39.1997-6/17629386_2041020062792134_1923669457641668608_n.png?stp=dst-png_s851x315&_nc_cat=102&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=s9EHEPlZvlMAb7SQxSk&_nc_ht=scontent.fhan20-1.fna&oh=00_AfA3wOeiyXBG1xM2ksViFo0k45DGNEkWUMW-ObMmcDDK-w&oe=6628886A",
        "https://scontent.fhan2-5.fna.fbcdn.net/v/t39.1997-6/17626022_2041020606125413_2477775072673136640_n.png?stp=dst-png_s851x315&_nc_cat=106&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=264T421J5-UAb4hNSFl&_nc_ht=scontent.fhan2-5.fna&oh=00_AfBZSKvQXgQzXTMHTGQkl6rChlvWvXltjKbmxlif73eYZA&oe=66287F8E",
        "https://scontent.fhan2-5.fna.fbcdn.net/v/t39.1997-6/17629537_2041021132792027_8197282887888797696_n.png?stp=dst-png_s851x315&_nc_cat=109&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=_wGEUe1SSGsAb74gqot&_nc_ht=scontent.fhan2-5.fna&oh=00_AfB4xmMlj-miMoVFr-6uIq2uVD7HaE231QO558ZnpycOdg&oe=6628764E",
        "https://scontent.fhan2-4.fna.fbcdn.net/v/t39.1997-6/17351560_2041021612791979_5000053230667825152_n.png?stp=dst-png_s851x315&_nc_cat=110&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=jQU2whIssUMAb7XP3SW&_nc_ht=scontent.fhan2-4.fna&oh=00_AfDeCj8X9oEJgnWnbsvexnP_gu5ARQKBZdL0jlZohllhbg&oe=66288832",
        "https://scontent.fhan2-4.fna.fbcdn.net/v/t39.1997-6/17636541_2041022039458603_8103665769205727232_n.png?stp=dst-png_s851x315&_nc_cat=100&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=G2j2ZEY9R_UAb6dxs5I&_nc_ht=scontent.fhan2-4.fna&oh=00_AfD7f9ZmVaS9BqXjKhO5Wg_23vua64Lae9CFUob7aY3HGQ&oe=662889E9",
        "https://scontent.fhan20-1.fna.fbcdn.net/v/t39.1997-6/17119969_2041022299458577_4231396445669818368_n.png?stp=dst-png_s851x315&_nc_cat=104&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=L97ydOipCrgAb6WFV0l&_nc_ht=scontent.fhan20-1.fna&oh=00_AfA35IrwNQ7vMFEB5A8y6ZSZU3VsUpGNW944g1f3-wWPaw&oe=66286B32"
    ];
    let path = process.cwd() + '/public/images/emoji/first/';
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
        status:200
    })
})
module.exports = router;