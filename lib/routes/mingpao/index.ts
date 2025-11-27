import path from 'node:path';

import * as cheerio from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import parser from '@/utils/rss-parser';

const renderFanBox = (media) =>
    art(path.join(__dirname, 'templates/fancybox.art'), {
        media,
    });

const renderDesc = (media, desc) =>
    art(path.join(__dirname, 'templates/description.art'), {
        media: renderFanBox(media),
        desc,
    });

const fixFancybox = (element, $) => {
    const $e = $(element);
    const url = new URL($e.attr('href'));
    let video;
    if (url.hostname === 'videop.mingpao.com') {
        video = new URL(url.searchParams.get('file'));
        video.hostname = 'cfrvideo.mingpao.com'; // use cloudflare cdn
        video = video.href;
    }
    return {
        href: url.href,
        title: $e.attr('title'),
        video,
    };
};

export const route: Route = {
    path: '/:type?/:category?',
    name: '新聞',
    example: '/mingpao/ins/all',
    parameters: {
        type: {
            description: '新聞類型',
            default: 'ins',
            options: [
                { value: 'ins', label: '即時新聞' },
                { value: 'pns', label: '每日明報' },
            ],
        },
        category: '頻道，見下表',
    },
    radar: [
        {
            title: '即時新聞',
            source: ['news.mingpao.com/ins/:categoryName/section/:date/:category'],
            target: '/mingpao/ins/:category',
        },
        {
            title: '每日明報',
            source: ['news.mingpao.com/pns/:categoryName/section/:date/:category'],
            target: '/mingpao/pns/:category',
        },
    ],
    maintainers: ['TonyRL'],
    handler,
    description: `| category | 即時新聞頻道 |
| -------- | ------------ |
| all      | 總目錄       |
| s00001   | 港聞         |
| s00002   | 經濟         |
| s00003   | 地產         |
| s00004   | 兩岸         |
| s00005   | 國際         |
| s00006   | 體育         |
| s00007   | 娛樂         |
| s00022   | 文摘         |
| s00024   | 熱點         |

| category | 每日明報頻道 |
| -------- | ------------ |
| s00001   | 要聞         |
| s00002   | 港聞         |
| s00003   | 社評         |
| s00004   | 經濟         |
| s00005   | 副刊         |
| s00011   | 教育         |
| s00012   | 觀點         |
| s00013   | 中國         |
| s00014   | 國際         |
| s00015   | 體育         |
| s00016   | 娛樂         |
| s00017   | English      |
| s00018   | 作家專欄     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'ins';
    const category = ctx.req.param('category') ?? (type === 'ins' ? 'all' : 's00001');
    const link = `https://news.mingpao.com/rss/${type}/${category}.xml`;

    const feed = await parser.parseURL(link);
    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link, {
                    headers: {
                        Referer: 'https://news.mingpao.com/',
                    },
                });

                const $ = cheerio.load(response);
                const topVideo = $('#topvideo').length
                    ? $('#topvideo iframe')
                          .toArray()
                          .map((e) => $(e).attr('href', $(e).attr('src')))
                          .map((e) => fixFancybox(e, $))
                    : [];
                const fancyboxImg = $('a.fancybox').length ? $('a.fancybox') : $('a.fancybox-buttons');

                // remove unwanted elements
                $('div.ad300ins_m').remove();
                $('div.clear, div.inReadLrecGroup, div.clr').remove();
                $('div#ssm2').remove();
                $('iframe').remove();
                $('p[dir=ltr]').remove();

                // extract categories
                item.category = item.categories;

                // fix fancybox image
                let fancybox = [...topVideo, ...fancyboxImg.toArray().map((e) => fixFancybox(e, $))];
                const script = $('script')
                    .toArray()
                    .find((e) => $(e).text()?.includes("$('#lower').prepend('"));
                const lowerContent = script
                    ? $(script)
                          .text()
                          ?.match(/\$\('#lower'\)\.prepend\('(.*)'\);/)?.[1]
                          ?.replaceAll(String.raw`\"`, '"')
                    : '';
                if (lowerContent) {
                    const $ = cheerio.load(lowerContent, null, false);
                    fancybox = [
                        ...fancybox,
                        ...$('a.fancybox')
                            .toArray()
                            .map((e) => fixFancybox(e, $)),
                    ];
                }

                // remove unwanted key value
                delete item.categories;
                delete item.content;
                delete item.contentSnippet;
                delete item.creator;
                delete item.isoDate;

                item.description = renderDesc(fancybox, $('.txt4').html() ?? $('.article_content.line_1_5em').html() ?? $('.txt3').html());
                item.pubDate = parseDate(item.pubDate);
                item.guid = item.link.includes('?') ? item.link : item.link.slice(0, item.link.lastIndexOf('/'));

                return item;
            })
        )
    );

    return {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
        image: feed.image.url,
        language: feed.language,
    };
}
