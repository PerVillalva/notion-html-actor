import { Actor, Dataset, log } from "apify";
import { blocksToMD, findDatabaseItems, updateItemStatus } from "./notion.js";
import { createPost } from "./ghost.js";
import { updateKeyValueStoreName } from "./img_optimizer/apifyData.js";

await Actor.init();

export const {
    notionToken,
    notionDatabaseID,
    notionFilterValue,
    notionUpdatedValue,
    ghostURL,
    ghostKey,
    optimizeImages,
    compressionMode,
} = await Actor.getInput();

try {
    const pagesData = await findDatabaseItems(
        notionDatabaseID,
        notionToken,
        notionFilterValue
    );

    for (let pageData of pagesData) {
        const { pageId, title } = pageData;

        const result = await blocksToMD(notionToken, pageId);

        await Dataset.pushData(result);

        const storeTitle = title
            .toLowerCase() // Convert all letters to lowercase.
            .replace(/\s+/g, "-") // Replace all spaces with hyphens.
            .replace(/[^a-z0-9-]/g, "") // Remove all characters that are not a-z, 0-9, or -.
            .replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens.

        await updateKeyValueStoreName(storeTitle);

        await createPost(ghostURL, ghostKey, result.articleContent, title);

        log.info(`✅ "${title}" article was successfully created on Ghost.`);

        if (notionUpdatedValue) {
            await updateItemStatus(pageId, notionToken, notionUpdatedValue);

            log.info(
                `🔁 "${title}" item status updated from "${notionFilterValue}" to "${notionUpdatedValue}" in Notion.`
            );
        }
    }
} catch (error) {
    log.error(error);
}

await Actor.exit();
