import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import showdown from "showdown";

export async function blocksToMD(token, pageID) {
    const notionClient = new Client({ auth: token });

    const n2m = new NotionToMarkdown({
        notionClient: notionClient,
        config: {
            separateChildPage: true, // default: false
        },
    });

    const mdblocks = await n2m.pageToMarkdown(pageID);
    mdblocks.forEach((block) =>
        block.type === "table" ? console.log(block) : ""
    );
    const mdString = n2m.toMarkdownString(mdblocks);

    const converter = new showdown.Converter();
    converter.setOption("tables", true);
    const outputHTML = converter.makeHtml(mdString.parent);

    return { articleContent: outputHTML };
}
