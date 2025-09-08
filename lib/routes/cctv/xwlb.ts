import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { load } from 'cheerio';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
dayjs.extend(customParseFormat);

export const route: Route = {
    path: '/:site/:category/:name',
    categories: ['traditional-media'],
    example: '/cctv/tv/lm/xwlb',
    parameters: {
        site: "站点, 可选值如'tv', 既'央视节目'",
        category: "分类名, 官网对应分类, 当前可选值'lm', 既'栏目大全'",
        name: {
            description: "栏目名称, 可在对应栏目页面 URL 中找到, 可选值如'xwlb',既'新闻联播'",
            options: [
                {
                    value: 'xwlb',
                    label: '新闻联播',
                },
            ],
        },
    },
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
            source: ['tv.cctv.com/lm/xwlb', 'tv.cctv.com/'],
        },
    ],
    name: '新闻联播',
    maintainers: ['zengxs'],
    handler,
    url: 'tv.cctv.com/lm/xwlb',
    description: `新闻联播内容摘要。`,
};

async function handler(ctx) {
    const { site, category, name } = ctx.req.param();
    let responseData;
    if (site === 'tv' && category === 'lm' && name === 'xwlb') {
        responseData = await getXWLB();
    }
    return responseData;
}

const getXWLB = async () => {
    const res = await got({ method: 'get', url: 'https://tv.cctv.com/lm/xwlb/' });
    const $ = load(res.data);
    // 解析最新一期新闻联播的日期
    const latestDate = dayjs($('.rilititle p').text(), 'YYYY-MM-DD');
    const count: number[] = [];
    for (let i = 0; i < 20; i++) {
        count.push(i);
    }
    const resultItems = await Promise.all(
        count.map(async (i) => {
            const newsDate = latestDate.subtract(i, 'days').hour(19);
            const url = `https://tv.cctv.com/lm/xwlb/day/${newsDate.format('YYYYMMDD')}.shtml`;
            const item = {
                title: `新闻联播 ${newsDate.format('YYYY/MM/DD')}`,
                link: url,
                pubDate: timezone(parseDate(newsDate.format()), +8),
                description: await cache.tryGet(url, async () => {
                    const res = await got(url);
                    const content = load(res.data);
                    const list: string[] = [];
                    content('body li').map((i, elem) => {
                        const e = content(elem);
                        const href = e.find('a').attr('href');
                        const title = e.find('a').attr('title');
                        const dur = e.find('span').text();
                        list.push(`<a href="${href}">${title} ⏱${dur}</a>`);
                        return i;
                    });
                    return list.join('<br/>\n');
                }),
            };
            return item;
        })
    );

    return {
        title: 'CCTV 新闻联播',
        link: 'http://tv.cctv.com/lm/xwlb/',
        item: resultItems,
    };
};
export default getXWLB;
