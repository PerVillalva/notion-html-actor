import { Actor, Dataset } from "apify";
import { blocksToMD } from "./notion.js";

await Actor.init();

const { notionToken, dbPageID } = await Actor.getInput();

const result = await blocksToMD(notionToken, dbPageID);

await Dataset.pushData(result);

await Actor.exit();
