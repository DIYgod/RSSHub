import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { art } from '@/utils/render';
import { parseDate } from '@/utils/parse-date';
import path from 'node:path';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { MisskeyNote } from './types';

const allowSiteList = ['misskey.io', 'madost.one', 'mk.nixnet.social'];

const parseNotes = (data: MisskeyNote[], site: string) =>
    data.map((item: MisskeyNote) => {
        const isRenote = item.renote && Object.keys(item.renote).length > 0;
        const isReply = item.reply && Object.keys(item.reply).length > 0;
        const noteToUse: MisskeyNote = isRenote ? (item.renote as MisskeyNote) : item;

        const host = noteToUse.user.host ?? site;
        const author = `${noteToUse.user.name} (${noteToUse.user.username}@${host})`;

        const description = art(path.join(__dirname, 'templates/note.art'), {
            text: noteToUse.text,
            files: noteToUse.files,
            reply: item.reply,
            site,
        });

        let title = '';
        if (isReply && item.reply) {
            const replyToHost = item.reply.user.host ?? site;
            const replyToAuthor = `${item.reply.user.name} (${item.reply.user.username}@${replyToHost})`;
            title = `Reply to ${replyToAuthor}: "${noteToUse.text ?? ''}"`;
        } else if (isRenote) {
            title = `Renote: ${author}: "${noteToUse.text ?? ''}"`;
        } else {
            title = `${author}: "${noteToUse.text ?? ''}"`;
        }

        const link = `https://${host}/notes/${noteToUse.id}`;
        const pubDate = parseDate(noteToUse.createdAt);

        return {
            title,
            description,
            pubDate,
            link,
            author,
        };
    });
async function getUserTimelineByUsername(username, site, { withRenotes = false, mediaOnly = false }) {
    const searchUrl = `https://${site}/api/users/search-by-username-and-host`;
    const cacheUid = `misskey_username/${site}/${username}`;

    const accountId = await cache.tryGet(cacheUid, async () => {
        const searchResponse = await got({
            method: 'post',
            url: searchUrl,
            json: {
                username,
                host: site,
                detail: true,
                limit: 1,
            },
        });
        const userData = searchResponse.data.find((item) => item.username === username);

        if (!userData) {
            throw new Error(`username ${username} not found`);
        }
        return userData.id;
    });

    // https://misskey.io/api-doc#tag/users/operation/users___notes
    const usernotesUrl = `https://${site}/api/users/notes`;
    const usernotesResponse = await got({
        method: 'post',
        url: usernotesUrl,
        json: {
            userId: accountId,
            withChannelNotes: true,
            withRenotes,
            withReplies: !mediaOnly, // Disable replies if mediaOnly is true
            withFiles: mediaOnly,
            limit: 10,
            offset: 0,
        },
    });
    const accountData = usernotesResponse.data;
    return { site, accountId, accountData };
}

export default { parseNotes, getUserTimelineByUsername, allowSiteList };
