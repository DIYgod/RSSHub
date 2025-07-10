import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';

const moeUrl = 'https://www.moe.gov.cn/';
const typesIdMap = [
    { type: 'policy_anal', id: 'tt_con2', name: '政策解读' },
    { type: 'newest_file', id: 'nine_con1', name: '最新文件' },
    { type: 'notice', id: 'nine_con2', name: '公告公示' },
    { type: 'edu_ministry_news', id: 'nine_con3', name: '教育部简报' },
    { type: 'edu_focus_news', id: 'eight_con2 .pchide>.TRS_Editor', name: '教育要闻' },
];

export const route: Route = {
    path: '/moe/:type',
    categories: ['government'],
    example: '/gov/moe/policy_anal',
    parameters: { type: '分类名' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '新闻',
    maintainers: ['Crawler995'],
    handler,
    description: `|   政策解读   |   最新文件   | 公告公示 |      教育部简报     |     教育要闻     |
| :----------: | :----------: | :------: | :-----------------: | :--------------: |
| policy\_anal | newest\_file |  notice  | edu\_ministry\_news | edu\_focus\_news |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    let id = '';
    let name = '';

    for (const item of typesIdMap) {
        if (item.type === type) {
            id = item.id;
            name = item.name;
        }
    }

    if (id === '') {
        logger.error('The given type not found.');
        return;
    }

    const response = await got(moeUrl);

    const $ = load(response.data);
    const newsLis = $('div#' + id + '>ul>li');

    return {
        title: name,
        link: moeUrl,
        item: await Promise.all(
            newsLis.toArray().map(async (item) => {
                item = $(item);

                const firstA = item.find('a');
                const itemUrl = new URL(firstA.attr('href'), moeUrl).href;

                // some live pages have no content, just return the liva page url
                const infos = itemUrl.includes('/live/')
                    ? {
                          description: firstA.html(),
                      }
                    : await cache.tryGet(itemUrl, async () => {
                          const res = {};
                          const response = await got({
                              method: 'get',
                              url: itemUrl,
                              headers: {
                                  Referer: moeUrl,
                              },
                          });
                          const data = load(response.data);

                          if (itemUrl.includes('www.gov.cn')) {
                              res.description = data('#UCAP-CONTENT').html();
                          } else if (itemUrl.includes('srcsite')) {
                              res.description = data('div#content_body_xxgk').html();
                          } else if (itemUrl.includes('jyb_')) {
                              res.description = data('div.moe-detail-box').html() || data('div#moe-detail-box').html();
                          }

                          return res;
                      });

                return {
                    title: firstA.text(),
                    description: infos.description,
                    link: itemUrl,
                    pubDate: parseDate(item.find('span').text(), 'MM-DD'),
                };
            })
        ),
    };
}
