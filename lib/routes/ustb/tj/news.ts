import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://tj.ustb.edu.cn';
const maps = {
    xyxw: '/news/xyxw.htm',
    xshhd: '/Class/xshhd/index.htm',
    csjsxy: '/Class/csjsxy/index.htm',
    xxgcxy: '/Class/xxgcxy/index.htm',
    jjx: '/Class/jjx/index.htm',
    glxy: '/Class/glxy/index.htm',
    clx: '/Class/clx/index.htm',
    jxgcx: '/Class/jxgcx/index.htm',
    hlx: '/Class/hlx/index.htm',
    flx: '/Class/flx/index.htm',
    wyx: '/Class/wyx/index.htm',
    ysx: '/Class/ysx/index.htm',
};
function getNews(data, listingUrl: string) {
    const $ = load(data);
    const modernList = $('.zy_left li[id^="line_u6_"]');
    if (modernList.length) {
        return modernList.toArray().map((element) => {
            const anchor = $(element).find('a').first();
            const published = anchor.find('.time > span').first().text().trim();
            const image = anchor.find('.pic img').attr('src');
            return {
                title: anchor.find('h1').text(),
                link: new URL(anchor.attr('href')!, listingUrl).href,
                pubDate: published ? timezone(parseDate(published, 'YYYY.MM.DD'), 8) : undefined,
                description: anchor.find('p').prop('outerHTML') ?? undefined,
                image: image ? new URL(image, listingUrl).href : undefined,
            };
        });
    }
    return $('div[class="classnews"] ul li a')
        .toArray()
        .map((elem) => {
            const textNode = elem.children[0];
            return {
                link: baseUrl + elem.attribs.href,
                title: textNode?.nodeType === 3 ? textNode.data : undefined,
                pubDate: timezone(parseDate(elem.attribs.href.split('/', 4)[3].split('.', 1)[0].slice(0, 14), 'YYYYMMDDHHmmss'), 8),
            };
        });
}
export const route: Route = {
    path: '/tj/news/:type?',
    categories: ['university'],
    example: '/ustb/tj/news/xyxw',
    parameters: { type: '默认为 `all`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '天津学院',
    maintainers: ['henbf'],
    handler,
    description: `| 全部 | 学院新闻 | 学术活动 | 城市建设学院 | 信息工程学院 | 经济学院 | 管理学院 | 材料系 | 机械工程系 | 护理系 | 法律系 | 外语系 | 艺术系 |
| ---- | -------- | -------- | ------------ | ------------ | -------- | -------- | ------ | ---------- | ------ | ------ | ------ | ------ |
| all  | xyxw     | xshhd    | csjsxy       | xxgcxy       | jjx      | glxy     | clx    | jxgcx      | hlx    | flx    | wyx    | ysx    |`,
};
async function handler(ctx) {
    let type = ctx.req.param('type') || 'all';
    if (!Object.keys(maps).includes(type)) {
        type = 'all';
    }
    let item;
    if (type === 'all') {
        const all = await pMap(
            Object.values(maps),
            async (link) => {
                const response = await got(baseUrl + link);
                const news = getNews(response.data, baseUrl + link);
                return news;
            },
            { concurrency: 3 }
        );
        item = all.flat();
    } else {
        const response = await got(baseUrl + maps[type]);
        item = getNews(response.data, baseUrl + maps[type]);
    }
    return {
        title: '北京科技大学天津学院新闻动态',
        link: baseUrl,
        item,
    };
}
