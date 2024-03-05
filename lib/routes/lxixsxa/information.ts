// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
const { parseJSONP } = require('./jsonp-helper');
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
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

    ctx.set('data', {
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
            description: art(path.join(__dirname, 'templates/info.art'), {
                category: item.category,
                description: item.description.replaceAll('\n', '<br>'),
            }),
            // the article publish time
            pubDate: parseDate(item.date),
            // the article link
            link: `${url}/${item.id}`,
        })),
    });
};
