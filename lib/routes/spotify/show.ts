// @ts-nocheck
const utils = require('./utils');
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const token = await utils.getPublicToken();
    const id = ctx.req.param('id');

    const meta = await got
        .get(`https://api.spotify.com/v1/shows/${id}?market=US`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .json();

    const episodes = meta.episodes.items;

    ctx.set('data', {
        title: meta.name,
        description: meta.description,
        link: meta.external_urls.spotify,
        language: meta.languages[0],
        itunes_author: meta.publisher,
        itunes_category: meta.type,
        itunes_explicit: meta.explicit,
        allowEmpty: true,
        item: episodes.map((x) => ({
            title: x.name,
            description: x.html_description,
            pubDate: parseDate(x.release_date),
            link: x.external_urls.spotify,
            itunes_item_image: x.images[0].url,
            itunes_duration: x.duration_ms * 1000,
            enclosure_url: x.audio_preview_url,
            enclosure_type: 'audio/mpeg',
        })),
        image: meta.images.length ? meta.images[0].url : undefined,
    });
};
