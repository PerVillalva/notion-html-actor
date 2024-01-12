import { Actor, Dataset } from "apify";
import { processPages } from "./notion.js";

await Actor.init();

const { notionToken, dbPageID } = await Actor.getInput();

const result = await processPages(notionToken, dbPageID);

await Dataset.pushData(result);

await Actor.exit();
