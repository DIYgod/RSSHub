import path from 'node:path';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

import { parseJSONP } from './jsonp-helper';

export const route: Route = {
    path: '/disco',
    categories: ['live'],
    example: '/lxixsxa/disco',
    parameters: {},
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
            source: ['www.lxixsxa.com/', 'www.lxixsxa.com/discography'],
        },
    ],
    name: 'Latest Discography',
    maintainers: ['Kiotlin'],
    handler,
    url: 'www.lxixsxa.com/',
};

async function handler() {
    const api = 'https://www.sonymusic.co.jp/json/v2/artist/lisa/discography/start/0/count/-1';
    const url = 'https://www.sonymusic.co.jp/artist/lisa/discography';

    const title = 'LATEST DISCOGRAPHY';

    const response = await got({
        method: 'get',
        url: api,
    });

    const data = parseJSONP(response.data).items.map((item) => ({
        title: item.title,
        referID: item.representative_goods_number,
        imageLink: item.image === '' ? item.image_original : item.image,
        type: item.type,
        releaseDate: item.release_date,
        price: item.price === '' ? 'Unknown Yet' : item.price + ' (Tax Inclusive)',
        description: item.comment,
        comment: item.catch_copy === '' ? '今日もいい日だ！' : item.catch_copy,
    }));

    return {
        // the source title
        title,
        // the source url
        link: url,
        // the source description
        description: "LiSA's Latest Albums",
        // iterate through all leaf objects
        item: data.map((item) => ({
            // the article title
            title: item.title,
            // the article content
            description: art(path.join(__dirname, 'templates/disco.art'), {
                comment: item.comment,
                type: item.type,
                price: item.price,
                image: item.imageLink,
                description: item.description,
            }),
            // the article publish time
            pubDate: parseDate(item.releaseDate),
            // the article link
            link: `${url}/${item.referID}`,
        })),
    };
}
