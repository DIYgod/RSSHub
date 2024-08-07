import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { art } from '@/utils/render';
import { parseDate } from '@/utils/parse-date';
import path from 'node:path';
import cache from '@/utils/cache';
import got from '@/utils/got';

const allowSiteList = ['misskey.io', 'madost.one', 'mk.nixnet.social'];

// docs on: https://misskey-hub.net/docs/api/entity/note.html
const parseNotes = (data, site) =>
    data.map((item) => {
        const host = item.user.host === null ? site : item.user.host;
        const author = `${item.user.name} (@${item.user.username}@${host})`;
        const description = art(path.join(__dirname, 'templates/note.art'), {
            text: item.text,
            files: item.files,
        });
        const title = `${author}: "${description}"`;
        const link = `https://${host}/notes/${item.id}`;
        const pubDate = parseDate(item.createdAt);
        return {
            title,
            description,
            pubDate,
            link,
            author,
        };
    });

async function getUserTimelineByUsername(username, site) {
    const search_url = `https://${site}/api/users/search-by-username-and-host`;
    const cacheUid = `misskey_username/${site}/${username}`;

    const account_id = await cache.tryGet(cacheUid, async () => {
        const search_response = await got({
            method: 'post',
            url: search_url,
            json: {
                username,
                host: site,
                detail: true,
                limit: 1,
            },
        });
        const userData = search_response.data.filter((item) => item.username === username);

        if (userData.length === 0) {
            throw new Error(`username ${username} not found`);
        }
        return userData[0].id;
    });

    const usernotes_url = `https://${site}/api/users/notes`;
    const usernotes_response = await got({
        method: 'post',
        url: usernotes_url,
        json: {
            userId: account_id,
            withChannelNotes: true,
            limit: 10,
            offset: 0,
        },
    });
    const account_data = usernotes_response.data;
    return { site, account_id, account_data };
}

export default { parseNotes, getUserTimelineByUsername, allowSiteList };
