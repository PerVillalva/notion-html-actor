import GhostAdminAPI from "@tryghost/admin-api";

const GHOST_API_VERSION = "v5.0";
const POST_STATUS_DRAFT = "draft";

/**
 * Creates a connection to the Ghost Admin API.
 */
function ghostAPIConnection(ghostUrl, ghostKey) {
    const api = new GhostAdminAPI({
        url: ghostUrl,
        key: ghostKey,
        version: GHOST_API_VERSION,
    });

    return api;
}

/**
 * Creates a new post in Ghost.
 */
export async function createPost(ghostUrl, ghostKey, htmlContent, title) {
    const api = ghostAPIConnection(ghostUrl, ghostKey);

    try {
        await api.posts.add(
            {
                title: title,
                html: htmlContent,
                status: POST_STATUS_DRAFT,
            },
            { source: "html" } // Tell the API to use HTML as the content source, instead of Lexical
        );
    } catch (err) {
        console.error("Failed to create post:", err);
        throw err;
    }
}
