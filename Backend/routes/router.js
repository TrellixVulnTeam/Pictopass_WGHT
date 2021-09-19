const express = require("express");
const router = express.Router();
const Jimp = require("jimp");

let length = 8;
/*
    Parameters:
        canvas - offscreen html canvas
        img - offscreen html img
        dataUrl - image data string
*/
router.post("/newImage", (req, res) => {
    let pixData = [];
    let buffer = Buffer.from(req.body.file.split(',')[1], "base64");
    Jimp.read(buffer).then( (image) => {
        for(let i = 0; i < image.bitmap.width; i++){
            for(let j = 0; j < image.bitmap.height; j++){
                pixData.push(Jimp.intToRGBA(image.getPixelColor(i, j)));
            }
        }
        let passwordPool = genPasswordPool(pixData);
        let password = genPassword(passwordPool, length, image.bitmap.width, image.bitmap.height);
    }).catch(err => {
        console.log(err);
        res.send({
            status: 500,
            message: "Input is not an image"
        });
    });
});

router.post("/updateLength", (req, res) => {
    length = req.body.length != null ? req.body.length : 8;
    res.send(length);
});

const genPasswordPool = (pixData) => {
    const GOLDEN_NUMBER = 17.09;
    let bound = 80;

    let chars = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
                 "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
                 "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "!", "(", ")", ".", "?", "[", "]", "-", "`", "~", ";", ":", "@", "#", "$", "%",
                 "^", "&", "*", "+", "="];
    let hash = [];
    let passwordPool = [];

    for(let pos = 0; pos <= bound + 1; pos++){
        if(pos > bound){
            chars.splice(Math.floor(Math.random() * bound), 1);
            bound--;
            pos = 0;
        }
        hash.push(chars[pos]);
    }

    for(let i = 0; i < pixData.length; i++){
        pixVal = ((pixData[i].r / GOLDEN_NUMBER) * (pixData[i].b / GOLDEN_NUMBER) * (pixData[i].g / GOLDEN_NUMBER));
        passwordPool.push(hash[Math.trunc(pixVal)]);
    }
    return passwordPool;
}

const genPassword = (passwordPool, length, imgWidth, imgHeight) => {
    let password = "";
    for(let i = 0; i < length; i++){
        let x = Math.floor(Math.random() * imgWidth);
        let y = Math.floor(Math.random() * imgHeight);
        password += passwordPool[x * y];
    }
    console.log(password);
}

module.exports = router;