import axios from "axios";
import * as cheerio from "cheerio";
import sharp from "sharp";
import { KeyValueStore, log } from "apify";

export async function optimizeImg(html, compressionMode) {
    // Use cheerio with specific options to preserve structure
    const $ = cheerio.load(
        html,
        {
            withStartIndices: false,
            withEndIndices: false,
            xmlMode: false,
            decodeEntities: false,
        },
        false
    ); // Parse as HTML fragment, not full document

    const imgElements = $("img");
    const imageData = [];

    // First pass: collect all image data without modifying the DOM
    for (let i = 0; i < imgElements.length; i++) {
        const img = imgElements[i];
        const imgUrl = $(img).attr("src");

        if (!imgUrl) {
            console.log(`Skipping image without src attribute at index ${i}`);
            continue;
        }

        // Extract the image name from the URL
        const imgName =
            $(img)
                .attr("alt")
                ?.toLowerCase() // Convert all letters to lowercase.
                .replace(/\s+/g, "-") // Replace all spaces with hyphens.
                .replace(/[^a-z0-9-]/g, "") // Remove all characters that are not a-z, 0-9, or -.
                .replace(/^-+|-+$/g, "") || `image-${i}`; // Remove leading and trailing hyphens or use fallback

        imageData.push({
            element: img,
            url: imgUrl,
            name: imgName,
            index: i,
        });
    }

    // Second pass: process images sequentially to maintain order
    for (const imageInfo of imageData) {
        const { element: img, url: imgUrl, name: imgName } = imageInfo;

        try {
            log.info(`Processing image: ${imgUrl}`);

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
            const optimizedImgBuffer = await sharp(imgBuffer, {
                animated: true,
            })
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

            console.log(`Image optimized and replaced: ${imgUrl}`);
        } catch (error) {
            console.error(`Error processing image: ${imgUrl}`, error);
            // Keep original image URL if upload fails
        }
    }

    // Get the HTML content without wrapping html/body tags
    const optimizedHTML = $("body").length > 0 ? $("body").html() : $.html();

    return optimizedHTML;
}
