/**
 * Cleans up the Markdown content to ensure it is well-formatted.
 * @param {string} mdString - The raw Markdown string.
 * @returns {string} - The cleaned Markdown string.
 */
export function cleanMarkdown(mdString) {
    // Remove extra newlines (more than 2) and replace with <br>
    let cleanedMD = mdString
        .replace(/\n{3,}/g, "<br><br>")
        .replace(/\n{2}/g, "<br>");

    // Replace any remaining single newlines with <br>
    cleanedMD = cleanedMD.replace(/\n/g, "<br>");

    // Fix headers (ensure there is a space after #)
    cleanedMD = cleanedMD.replace(/^(#+)([^\s#])/gm, "$1 $2");

    // Remove trailing spaces
    cleanedMD = cleanedMD.replace(/[ \t]+$/gm, "");

    // Additional cleanup logic can be added here

    return cleanedMD;
}
