import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://tj.ustb.edu.cn';
// The old /Class/<department>/index.htm pages are gone; department news now lives under the news center's 院系动态 section
const maps = {
    xyxw: '/news/xyxw.htm',
    csjsxy: '/news/yxdt/csjsxy.htm',
    clkxygcxy: '/news/yxdt/clkxygcxy.htm',
    znzzxy: '/news/yxdt/znzzxy.htm',
    rgznxy: '/news/yxdt/rgznxy.htm',
    dkjsygcxy: '/news/yxdt/dkjsygcxy.htm',
    jjxy: '/news/yxdt/jjxy.htm',
    glxy: '/news/yxdt/glxy.htm',
    djkxy: '/news/yxdt/djkxy.htm',
    wgyxy: '/news/yxdt/wgyxy.htm',
    ysxy: '/news/yxdt/ysxy.htm',
    fxy: '/news/yxdt/fxy.htm',
    ldxy: '/news/yxdt/ldxy.htm',
    mkszyxy: '/news/yxdt/mkszyxy.htm',
    mdtsxy: '/news/yxdt/mdtsxy.htm',
    tyb: '/news/yxdt/tyb.htm',
    jcb: '/news/yxdt/jcb.htm',
};
function getNews(data, listingUrl: string) {
    const $ = load(data);
    return $('.zy_left li[id^="line_u6_"]')
        .toArray()
        .map((element) => {
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
    description: `| 全部 | 学院新闻 | 城市建设学院 | 材料科学与工程学院 | 智能制造学院 | 人工智能学院 | 低空技术与工程学院 | 经济学院 | 管理学院 |
| ---- | -------- | ------------ | ------------------ | ------------ | ------------ | ------------------ | -------- | -------- |
| all  | xyxw     | csjsxy       | clkxygcxy          | znzzxy       | rgznxy       | dkjsygcxy          | jjxy     | glxy     |

| 大健康学院 | 外国语学院 | 艺术学院 | 法学院 | 劳动学院 | 马克思主义学院 | 明德通识学院 | 体育部 | 基础部 |
| ---------- | ---------- | -------- | ------ | -------- | -------------- | ------------ | ------ | ------ |
| djkxy      | wgyxy      | ysxy     | fxy    | ldxy     | mkszyxy        | mdtsxy       | tyb    | jcb    |`,
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
