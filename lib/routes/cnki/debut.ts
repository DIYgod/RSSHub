import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

const rootUrl = 'https://chn.oversea.cnki.net';

export const route: Route = {
    path: '/journals/debut/:name',
    categories: ['journal'],
    example: '/cnki/journals/debut/LKGP',
    parameters: { name: '期刊缩写，可以在网址中得到' },
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
            source: ['navi.cnki.net/knavi/journals/:name/detail'],
        },
    ],
    name: '网络首发',
    maintainers: ['Fatpandac'],
    handler,
};

async function handler(ctx) {
    const name = ctx.req.param('name');

    const journalUrl = `${rootUrl}/knavi/JournalDetail?pcode=CjFD&pykm=${name}`;
    const title = await got.get(journalUrl).then((res) => load(res.data)('head > title').text());

    const outlineUrl = `${rootUrl}/knavi/JournalDetail/GetnfAllOutline`;
    const response = await got({
        method: 'post',
        url: outlineUrl,
        form: {
            pageIdx: '0',
            type: '2',
            pcode: 'CJFD',
            pykm: name,
        },
    });
    const $ = load(response.data);
    const list = $('dd')
        .map((_, item) => ({
            title: $(item).find('span.name > a').text().trim(),
            link: `${rootUrl}/kcms/detail/${new URLSearchParams(new URL(`${rootUrl}/${$(item).find('span.name > a').attr('href')}`).search).get('url')}.html`,
            pubDate: parseDate($(item).find('span.company').text(), 'YYYY-MM-DD HH:mm:ss'),
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got.get(item.link);
                const $ = load(detailResponse.data);
                item.description = art(path.join(__dirname, 'templates/desc.art'), {
                    author: $('h3.author > span')
                        .map((_, item) => $(item).text())
                        .get()
                        .join(' '),
                    company: $('a.author')
                        .map((_, item) => $(item).text())
                        .get()
                        .join(' '),
                    content: $('div.row > span.abstract-text').parent().text(),
                });

                return item;
            })
        )
    );

    return {
        title: `${title} - 全网首发`,
        link: `https://navi.cnki.net/knavi/journals/${name}/detail`,
        item: items,
    };
}
