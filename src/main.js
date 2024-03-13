import { Actor, Dataset, log } from "apify";
import { blocksToMD, findDatabaseItems, updateItemStatus } from "./notion.js";
import { createPost } from "./ghost.js";

await Actor.init();

const {
    notionToken,
    notionDatabaseID,
    notionFilterValue,
    notionUpdatedValue,
    ghostURL,
    ghostKey,
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

        await createPost(ghostURL, ghostKey, result.articleContent, title);

        log.info(`✅ "${title}" article was successfully created on Ghost.`);

        if (notionUpdatedValue) {
            await updateItemStatus(pageId, notionToken, notionUpdatedValue);

            log.info(
                `🔁 "${title}" item status updated from "${notionFilterValue}" to "${notionUpdatedValue}" in Notion.`
            );
        }

        await Dataset.pushData(result);
    }
} catch (error) {
    log.error(error);
}

await Actor.exit();
