import axios from "axios";
import * as cheerio from "cheerio";
import sharp from "sharp";
import { KeyValueStore } from "apify";

export async function optimizeImg(html, compressionMode) {
    const $ = cheerio.load(html);
    const imgElements = $("img");

    for (let i = 0; i < imgElements.length; i++) {
        const img = imgElements[i];
        const imgUrl = $(img).attr("src");

        // Extract the image name from the URL
        const imgName = $(img)
            .attr("alt")
            .toLowerCase() // Convert all letters to lowercase.
            .replace(/\s+/g, "-") // Replace all spaces with hyphens.
            .replace(/[^a-z0-9-]/g, "") // Remove all characters that are not a-z, 0-9, or -.
            .replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens.;

        // Download the image
        const response = await axios.get(imgUrl, {
            responseType: "arraybuffer",
        });
        const cType = response.headers["content-type"];

        // Skip SVG images
        if (cType === "image/svg+xml") {
            continue;
        }
        const imgBuffer = Buffer.from(response.data, "binary");

        const isLossless = compressionMode === "lossless";

        // Optimize and convert the image to webp
        const optimizedImgBuffer = await sharp(imgBuffer, { animated: true })
            .webp({ lossless: isLossless }) // Convert the image to webp.
            .toBuffer();

        // Open KeyValueStore
        const store = await KeyValueStore.open();

        // Store the optimized image in the key-value store
        await store.setValue(imgName, optimizedImgBuffer, {
            contentType: "image/webp",
        });

        // Get saved image's URL
        const optimizedImgUrl = store.getPublicUrl(imgName);

        // Replace the original image URL with the URL of the optimized image
        $(img).attr("src", optimizedImgUrl);
    }

    const optimizedHTML = $("body").html();

    return optimizedHTML;
}
