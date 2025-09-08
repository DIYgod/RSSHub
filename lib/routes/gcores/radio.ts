import { Route } from '@/types';

import { art } from '@/utils/render';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import got from '@/utils/got';
import md5 from '@/utils/md5';
import path from 'node:path';

export const route: Route = {
    path: '/radios/:category?',
    categories: ['new-media'],
    example: '/gcores/radios/45',
    parameters: { category: '分类名，默认为全部，可在分类页面的 URL 中找到，如 Gadio News -- 45' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    radar: [
        {
            source: ['gcores.com/categories/:category'],
            target: '/radios/:category',
        },
    ],
    name: '播客',
    maintainers: ['eternasuno'],
    handler,
    url: 'gcores.com/radios',
};

async function handler(ctx) {
    const category = ctx.req.param('category') || 'all';
    const limit = Number.parseInt(ctx.req.query('limit')) || 12;

    const link = getLink(category);
    const $ = load(await get(link));
    const title = $('head>title').text();
    const description = $('head>meta[name="description"]').attr('content');
    const image = $('head>link[rel="apple-touch-icon"]').attr('href');

    const api = getApi(category);
    api.searchParams.set('include', 'media');
    api.searchParams.set('page[limit]', limit.toString());
    api.searchParams.set('sort', '-published-at');
    api.searchParams.set('filter[list-all]', '0');
    api.searchParams.set('filter[is-require-privilege]', '0');
    api.searchParams.set('fields[radios]', 'title,cover,published-at,duration,content,media');
    const { data, included } = await get(api);

    const audios = {};
    for (const media of included) {
        audios[media.id] = media.attributes.audio;
    }

    const item = data.map((radio) => {
        const { id, attributes, relationships } = radio;

        const link = `https://www.gcores.com/radios/${id}`;
        const itunes_item_image = `https://image.gcores.com/${attributes.cover}`;
        const media_id = relationships.media.data.id;
        const enclosure_url = new URL(audios[media_id], 'https://alioss.gcores.com/uploads/audio/').toString();
        const description = art(path.join(__dirname, 'templates/content.art'), {
            content: JSON.parse(attributes.content),
        });

        return {
            title: attributes.title,
            author: '机核 GCORES',
            description,
            pubDate: parseDate(attributes['published-at']),
            guid: md5(link),
            link,
            itunes_item_image,
            itunes_duration: attributes.duration,
            enclosure_url,
            enclosure_type: 'audio/mpeg',
        };
    });

    return {
        title,
        link,
        description,
        language: 'zh-cn',
        itunes_author: '机核 GCORES',
        image: `https://www.gcores.com/${image}`,
        item,
    };
}

const get = async (url) => {
    const response = await got({
        method: 'get',
        url: new URL(url, 'https://www.gcores.com'),
    });

    return response.data;
};

const getLink = (category) => (category === 'all' ? 'https://www.gcores.com/radios' : `https://www.gcores.com/categories/${category}`);

const getApi = (category) => (category === 'all' ? new URL('https://www.gcores.com/gapi/v1/radios') : new URL(`https://www.gcores.com/gapi/v1/categories/${category}/radios`));
