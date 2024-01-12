import { Client } from "@notionhq/client";
import hljsPlugin from "@notion-render/hljs-plugin";
import bookmarkPlugin from "@notion-render/bookmark-plugin";
import { NotionRenderer } from "@notion-render/client";

async function getPageContent(pageId, notion) {
    let results = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
        const response = await notion.blocks.children.list({
            block_id: pageId,
            start_cursor: startCursor,
            page_size: 100, // you can set the maximum page size to 100
        });

        results = [...results, ...response.results];
        hasMore = response.has_more;
        startCursor = response.next_cursor;
    }

    return results;
}

export async function processPages(token, pageID) {
    const notionClient = new Client({ auth: token });

    const content = await getPageContent(pageID, notionClient);

    const notionRenderer = new NotionRenderer({
        client: notionClient,
    });

    notionRenderer.use(hljsPlugin({}));
    notionRenderer.use(bookmarkPlugin(undefined));

    const articleHtml = await notionRenderer.render(...content);

    const processedPages = {
        articleContent: articleHtml,
    };

    return processedPages;
}
