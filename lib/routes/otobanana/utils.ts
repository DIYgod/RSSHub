// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

const domain = 'otobanana.com';
const apiBase = `https://api.${domain}`;
const baseUrl = `https://${domain}`;

const getUserInfo = (id, tryGet) =>
    tryGet(`otobanana:user:${id}`, async () => {
        const { data } = await got(`${apiBase}/users/${id}/`);
        return data;
    });

const renderCast = (cast) => ({
    title: cast.title,
    description: art(path.join(__dirname, 'templates/description.art'), { cast }),
    pubDate: parseDate(cast.created_at),
    link: `https://otobanana.com/cast/${cast.id}`,
    author: `${cast.user.name} (@${cast.user.username})`,
    itunes_item_image: cast.thumbnail_url,
    itunes_duration: cast.duration_time,
    enclosure_url: cast.audio_url,
    enclosure_type: 'audio/x-m4a',
    upvotes: cast.like_count,
    comments: cast.comment_count,
});

const renderLive = (live) => ({
    title: live.title,
    description: live.is_open ? '配信中のライブ' : '終了しました',
    pubDate: parseDate(live.created_at),
    link: live.room_url,
    guid: `${live.room_url}#${live.id}`,
    author: `${live.user.name} (@${live.user.username})`,
    upvotes: live.like_count,
    comments: live.comment_count,
});

const renderPost = ({ id, type_label: type, cast, /** livestream  */ message /** , event */ }) => {
    switch (type) {
        case 'cast':
            return renderCast(cast);
        case 'message':
            return {
                title: message.text.split('\n')[0],
                description: message.text.replaceAll('\n', '<br>'),
                pubDate: parseDate(message.created_at),
                link: `https://otobanana.com/${type}/${id}`,
                author: `${message.user.name} (@${message.user.username})`,
                upvotes: message.like_count,
                comments: message.comment_count,
            };
        default:
            throw new Error(`Unknown post type: ${type}`);
    }
};

module.exports = {
    apiBase,
    baseUrl,
    getUserInfo,
    renderCast,
    renderLive,
    renderPost,
};
