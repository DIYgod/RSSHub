import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';

const host = 'https://www.nbt.edu.cn/';
const typeMap = {
    importance: '/cs_list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1013',
    news: '/lgxw/mtlg.htm',
    notice: '/cs_list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1015',
};

const titleMap = {
    importance: '理工要闻',
    news: '媒体理工',
    notice: '理工快讯',
};

export const route: Route = {
    path: '/:type',
    categories: ['university'],
    example: '/nbt/importance',
    parameters: { type: '通知类型，默认为理工要闻' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '理工要问',
    maintainers: ['bellongyan'],
    handler,
    description: `| 理工要闻 | 媒体理工 | 理工快讯 |
  | ---------- | ----- | ------ |
  | importance | news  | notice |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'notice';
    const link = host + typeMap[type];

    const title = '浙大宁波理工学院' + titleMap[type];
    const response = await got.get(link);
    const $ = load(response.data);
    const list = $('div[class="page_list2"] ul').find('li');

    const items = await Promise.all(
        list.map(async (i, item) => {
            const info = $(item).find('a').attr('href');
            const pageUrl = host + info;
            const result = await cache.tryGet(pageUrl, async () => {
                const page = await got.get(pageUrl);
                const $ = load(page.data);
                return {
                    desc: $('form[name="_newscontent_fromname"]').html(),
                };
            });
            const desc = typeof result === 'object' && result !== null ? result.desc : null;
            return {
                title: $(item).find('a').text(),
                link: pageUrl,
                description: desc,
            };
        })
    );
    return {
        title,
        link,
        item: items,
    };
}
