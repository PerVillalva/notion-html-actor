import axios from "axios";

const { APIFY_TOKEN, ACTOR_DEFAULT_KEY_VALUE_STORE_ID } = process.env;

export async function updateKeyValueStoreName(name) {
    axios.put(
        `https://api.apify.com/v2/key-value-stores/${ACTOR_DEFAULT_KEY_VALUE_STORE_ID}?token=${APIFY_TOKEN}`,
        {
            name,
        }
    );
}
