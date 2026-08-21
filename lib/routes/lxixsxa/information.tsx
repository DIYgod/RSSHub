import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { parseJSONP } from './jsonp-helper';

export const route: Route = {
    path: '/info',
    categories: ['live'],
    example: '/lxixsxa/info',
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
            source: ['www.lxixsxa.com/', 'www.lxixsxa.com/info'],
        },
    ],
    name: 'News',
    maintainers: ['Kiotlin'],
    handler,
    url: 'www.lxixsxa.com/',
};

async function handler() {
    const api = 'https://www.sonymusic.co.jp/json/v2/artist/lisa/information/start/0/count/-1';
    const url = 'https://www.sonymusic.co.jp/artist/lisa/info';

    const title = 'NEWS';

    const response = await got({
        method: 'get',
        url: api,
    });

    const data = parseJSONP(response.data).items.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        date: item.date,
        description: item.article,
    }));

    return {
        // the source title
        title,
        // the source url
        link: url,
        // the source description
        description: "Let's see what is new about LiSA.",
        // iterate through all leaf objects
        item: data.map((item) => ({
            // the article title
            title: item.title,
            // the article content
            description: renderToString(
                <>
                    {item.category ? <span>Category: {item.category}</span> : null}
                    {raw(item.description.replaceAll('\n', '<br>'))}
                </>
            ),
            // the article publish time
            pubDate: parseDate(item.date),
            // the article link
            link: `${url}/${item.id}`,
        })),
    };
}
