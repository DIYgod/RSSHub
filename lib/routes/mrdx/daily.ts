import { load } from 'cheerio';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { getElementChildrenInnerText } from './utils';

dayjs.extend(utc);

export const route: Route = {
    path: '/today',
    categories: ['traditional-media'],
    example: '/mrdx/today',
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
            source: ['mrdx.cn*'],
        },
    ],
    name: '今日',
    maintainers: ['Dustin-Jiang'],
    handler,
    url: 'mrdx.cn*',
};

async function handler() {
    const dateFormatted = dayjs().utcOffset(8).format('YYYYMMDD');

    const baseUrl = `http://mrdx.cn/content/${dateFormatted}`;
    const link = `${baseUrl}/Page01BC.htm`;

    const indexPageResponse = await got({
        url: link,
        method: 'get',
    });
    const $ = load(indexPageResponse.data);

    // Today's article URLs use the site's nonstandard `daoxiang` attribute.
    // eg: `<a class="foo" daoxiang="foo-bar.htm">Lorem ipsum</a>`
    const passagesList = $('.listdaohang > ul > li a')
        .toArray()
        .map((item) => ({
            link: new URL(`${baseUrl}/${item.attribs.daoxiang}`).href,
        }));

    const passages = await pMap(
        passagesList,
        (passage) =>
            cache.tryGet(`mrdx:article:${passage.link}`, async () => {
                const response = await got({
                    url: passage.link,
                    method: 'get',
                });

                const $ = load(response.data);

                // Headline parts span h2 through h5; middleware handles their whitespace.
                const title =
                    getElementChildrenInnerText($('.bggray > .margin15 > h2')[0]) +
                    getElementChildrenInnerText($('.bggray > .margin15 > h3')[0]) +
                    getElementChildrenInnerText($('.bggray > .margin15 > h4')[0]) +
                    getElementChildrenInnerText($('.bggray > .margin15 > h5')[0]);

                // The publisher and publication date are separated by repeated spaces.
                const [author, pubDate] = getElementChildrenInnerText($('.shijian')[0])
                    .split(' ')
                    .filter((item) => item !== '')
                    .map((item) => item.trim());

                const content = $('.contenttext');
                const metadata = content.children('table').filter((_, element) => $(element).text().includes('稿件来源'));
                const category = metadata
                    .text()
                    .match(/稿件来源[：:]\s*新华每日电讯\s*([^\n]+)/)?.[1]
                    ?.trim();
                metadata.remove();
                content.find('script, style, meta').remove();
                const byline = content
                    .children('div')
                    .contents()
                    .filter((_, node) => node.type === 'text' && /^\s*新华社记者\s/.test(node.data))
                    .first();
                const articleAuthor = byline.text().trim();
                byline.remove();

                return {
                    title,
                    author: articleAuthor || author,
                    pubDate: parseDate(pubDate, 'YYYY年MM月DD日'),
                    guid: passage.link,
                    link: passage.link,
                    description: content.html(),
                    category: category ? [category] : undefined,
                };
            }),
        { concurrency: 3 }
    );

    return {
        title: '新华每日电讯',
        link,
        item: passages,
        description:
            '中国报纸发行前三强。位列《人民日报》，《参考消息》之后。《新华每日电讯》是新华社出版的一份新闻电讯报，1993年创办，具有很高的权威性和准确性，有“一报在手，便知天下”之美誉。《新华每日电讯》为对开八版日报，集中刊登[新华社]每天向国内播发的电讯稿及图片稿。打开《新华每日电讯》，中国和全世界每天发生的重大事件便将一目了然。在人类生活节奏日益加快的当今世界，《新华每日电讯》以最便捷、最醒目的方式为公众提供最重要的新闻报道，受到公众的喜爱和拥护。',
    };
}
