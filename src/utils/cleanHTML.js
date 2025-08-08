import * as cheerio from "cheerio";

export function cleanHTML(htmlContent) {
    try {
        const $ = cheerio.load(htmlContent, { decodeEntities: false });

        // 1) Neutralize accidental <a> tags that are meant as text (no attributes / no href)
        $("a").each((_, el) => {
            const $el = $(el);
            const hasAttrs = Object.keys(el.attribs || {}).length > 0;
            const hasHref = !!$el.attr("href");
            if (!hasAttrs || !hasHref) {
                const inner = $el.html() ?? "";
                // Replace the <a> element with literal text and keep its inner content unwrapped
                $el.replaceWith(`&lt;a&gt;${inner}`);
            }
        });

        // 2) Escape literal HTML-like tokens in plain text (outside code/pre)
        const TAGS = [
            "a",
            "div",
            "span",
            "img",
            "p",
            "ul",
            "ol",
            "li",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "strong",
            "em",
        ];
        const openTagRe = new RegExp(`<(?:${TAGS.join("|")})(?=\\s|>)`, "gi");
        const closeTagRe = new RegExp(`</(?:${TAGS.join("|")})\\s*>`, "gi");

        function escapeIn(node) {
            // Skip code/pre blocks entirely
            if (node.type === "tag" && node.name === "pre") return;

            $(node)
                .contents()
                .each((__, child) => {
                    if (child.type === "text") {
                        const t = child.data;
                        const replaced = t
                            .replace(openTagRe, (m) => m.replace("<", "&lt;"))
                            .replace(closeTagRe, (m) => `&lt;/${m.slice(2)}`);
                        if (replaced !== t) child.data = replaced;
                    } else if (child.type === "tag") {
                        escapeIn(child);
                    }
                });
        }
        const root = $("body").length ? $("body")[0] : $.root()[0];
        escapeIn(root);

        // 3) Clean URLs inside code blocks (existing logic)
        const urlRegex = /["'](<https?:\/\/.*?>)["']/g;
        $("code").each(function () {
            const codeBlock = $(this);
            const codeBlockText = codeBlock.text();
            const urls = codeBlockText.match(urlRegex);
            if (urls) {
                let cleanedCodeBlockText = codeBlockText;
                urls.forEach((url) => {
                    const cleanedUrl = url.replace(/^["']<|>["']$/g, "");
                    cleanedCodeBlockText = cleanedCodeBlockText.replace(
                        url,
                        `"${cleanedUrl}"`
                    );
                });
                codeBlock.text(cleanedCodeBlockText);
            }
        });

        return $.html();
    } catch (error) {
        console.error("Error processing HTML content: ", error);
        return htmlContent;
    }
}
