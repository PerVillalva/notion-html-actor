import * as cheerio from "cheerio";

export function cleanHTML(htmlContent) {
    try {
        const $ = cheerio.load(htmlContent);
        const codeBlocks = $("code");

        // Regular expression to match URLs within quotes
        const urlRegex = /["'](<https?:\/\/.*?>)["']/g;

        codeBlocks.each(function () {
            const codeBlock = $(this);
            const codeBlockText = codeBlock.text();

            // Find URLs within the code block
            const urls = codeBlockText.match(urlRegex);

            if (urls) {
                let cleanedCodeBlockText = codeBlockText;
                urls.forEach((url) => {
                    // Remove the "<" and ">" characters from the URL
                    const cleanedUrl = url.replace(/^["']<|>["']$/g, "");
                    // Replace the original URL with the cleaned URL in the code block
                    cleanedCodeBlockText = cleanedCodeBlockText.replace(
                        url,
                        `"${cleanedUrl}"`
                    );
                });
                codeBlock.text(cleanedCodeBlockText);
            }
        });

        // Get the updated HTML content
        const updatedHtmlContent = $.html();
        return updatedHtmlContent;
    } catch (error) {
        console.error("Error processing HTML content: ", error);
    }
}
