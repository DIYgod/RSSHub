import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { parseItem } from './utils';

export const route: Route = {
    path: '/:category_id',
    categories: ['traditional-media'],
    example: '/scmp/3',
    parameters: { category_id: 'Category' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['scmp.com/rss/:category_id/feed'],
        },
    ],
    name: 'News',
    maintainers: ['proletarius101'],
    handler,
    description: `See the [official RSS page](https://www.scmp.com/rss) to get the ID of each category. This route provides fulltext that the offical feed doesn't.`,
};

const getAttribs = (attribs?: { [key: string]: string }) => {
    if (!attribs) {
        return;
    }
    const obj: { [key: string]: string } = {};
    for (const key in attribs) {
        if (Object.hasOwn(attribs, key)) {
            obj[key] = attribs[key];
        }
    }
    return obj;
};

async function handler(ctx) {
    const categoryId = ctx.req.param('category_id');
    const rssUrl = `https://www.scmp.com/rss/${categoryId}/feed`;
    const { data: response } = await got(rssUrl);
    const $ = load(response, {
        xmlMode: true,
    });

    const list = $('item')
        .toArray()
        .map((elem) => {
            const item = $(elem);
            const enclosure = item.find('enclosure').first();
            const mediaContent = item.find(String.raw`media\:content`).toArray()[0];
            const thumbnail = item.find(String.raw`media\:thumbnail`).toArray()[0];
            return {
                title: item.find('title').text(),
                description: item.find('description').text(),
                link: item.find('link').text().split('?utm_source')[0],
                author: item.find('author').text(),
                pubDate: parseDate(item.find('pubDate').text()),
                enclosure_url: enclosure?.attr('url'),
                enclosure_length: enclosure?.attr('length'),
                enclosure_type: enclosure?.attr('type'),
                media: {
                    content: mediaContent ? getAttribs(mediaContent.attribs) : {},
                    thumbnail: thumbnail?.attribs ? getAttribs(thumbnail.attribs) : undefined,
                },
            };
        });

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => parseItem(item))));

    ctx.set('json', {
        items,
    });

    return {
        title: $('channel > title').text(),
        link: $('channel > link').text(),
        description: $('channel > description').text(),
        item: items,
        language: 'en-hk',
        icon: 'https://assets.i-scmp.com/static/img/icons/scmp-icon-256x256.png',
        logo: 'https://customerservice.scmp.com/img/logo_scmp@2x.png',
        image: $('channel > image > url').text(),
    };
}
