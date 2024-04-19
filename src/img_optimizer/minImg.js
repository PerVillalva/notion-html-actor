import axios from "axios";
import * as cheerio from "cheerio";
import sharp from "sharp";
import { KeyValueStore } from "apify";

export async function optimizeImg(html) {
    const $ = cheerio.load(html);
    const imgElements = $("img");

    for (let i = 0; i < imgElements.length; i++) {
        const img = imgElements[i];
        const imgUrl = $(img).attr("src");

        // Download the image
        const response = await axios.get(imgUrl, {
            responseType: "arraybuffer",
        });
        const imgBuffer = Buffer.from(response.data, "binary");

        // Optimize and convert the image to webp
        const optimizedImgBuffer = await sharp(imgBuffer)
            .webp({ lossless: true }) // Convert the image to webp format in lossless mode.
            .toBuffer();

        // Open KeyValueStore
        const store = await KeyValueStore.open();

        // Store the optimized image in the key-value store
        await store.setValue(`img_${i}`, optimizedImgBuffer, {
            contentType: "image/webp",
        });

        // Get saved image's URL
        const optimizedImgUrl = store.getPublicUrl(`img_${i}`);

        // Replace the original image URL with the URL of the optimized image
        $(img).attr("src", optimizedImgUrl);
    }

    const optimizedHTML = $("body").html();

    return optimizedHTML;
}
