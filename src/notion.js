import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import showdown from "showdown";

const STATUS_PROPERTY = "Status";

function createNotionClient(token) {
    return new Client({ auth: token });
}

/**
 * Finds items in a Notion database that match a certain filter. If no filter is provided, it returns all items in the database.
 */
export async function findDatabaseItems(databaseId, token, filterValue) {
    const notionClient = createNotionClient(token);

    let query = {
        database_id: databaseId,
    };

    if (filterValue) {
        query.filter = {
            property: STATUS_PROPERTY,
            status: {
                equals: filterValue,
            },
        };
    }

    const response = await notionClient.databases.query(query);

    const pageInfo = response.results.map((item) => ({
        pageId: item.id,
        title: item.properties.Title.title[0].text.content,
        authors: item.properties.Author.people.map((author) => author.name),
    }));

    return pageInfo;
}

/**
 * Updates the status of an item in a Notion database.
 */
export async function updateItemStatus(pageId, token, updatedValue) {
    const notionClient = createNotionClient(token);

    await notionClient.pages.update({
        page_id: pageId,
        properties: {
            [STATUS_PROPERTY]: {
                status: {
                    name: updatedValue,
                },
            },
        },
    });
}

/**
 * Converts Notion blocks to Markdown.
 */
export async function blocksToMD(token, pageID) {
    const notionClient = createNotionClient(token);

    const n2m = new NotionToMarkdown({
        notionClient: notionClient,
        config: {
            separateChildPage: true, // default: false
        },
    });

    const mdblocks = await n2m.pageToMarkdown(pageID);
    const mdString = n2m.toMarkdownString(mdblocks);

    const converter = new showdown.Converter();
    converter.setOption("tables", true);
    const outputHTML = converter.makeHtml(mdString.parent);

    return { articleContent: outputHTML };
}
