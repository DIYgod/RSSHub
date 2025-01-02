import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const baseUrl = 'https://www.peopo.org';

export const route: Route = {
    path: '/topic/:topicId?',
    categories: ['new-media'],
    example: '/peopo/topic/159',
    parameters: { topicId: '分類 ID，見下表，默認為社會關懷' },
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
            source: ['peopo.org/topic/:topicId'],
            target: '/topic/:topicId',
        },
    ],
    name: '新聞分類',
    maintainers: [],
    handler,
    description: `| 分類     | ID  |
  | -------- | --- |
  | 社會關懷 | 159 |
  | 生態環保 | 113 |
  | 文化古蹟 | 143 |
  | 社區改造 | 160 |
  | 教育學習 | 161 |
  | 農業     | 163 |
  | 生活休閒 | 162 |
  | 媒體觀察 | 164 |
  | 運動科技 | 165 |
  | 政治經濟 | 166 |
  | 北台灣   | 223 |
  | 中台灣   | 224 |
  | 南台灣   | 225 |
  | 東台灣   | 226 |
  | 校園中心 | 167 |
  | 原住民族 | 227 |
  | 天然災害 | 168 |`,
};

async function handler(ctx) {
    const { topicId = '159' } = ctx.req.param();
    const url = `${baseUrl}/topic/${topicId}`;
    const response = await got(url);
    const $ = load(response.data);
    const list = $('.view-list-title')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').text(),
                link: new URL(item.find('a').attr('href'), baseUrl).href,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);

                item.author = $('#user-info h3').text();
                item.category = $('#node-terms .inline li')
                    .toArray()
                    .map((item) => $(item).find('a').text());
                item.pubDate = timezone(parseDate($('.submitted span').text()), +8);
                item.description = ($('.field-name-field-video-id .field-items').text() ? $('.field-name-field-video-id input').attr('value') : '') + $('.post_text_s .field-items').html();

                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        link: url,
        language: 'zh-TW',
        item: items,
    };
}
