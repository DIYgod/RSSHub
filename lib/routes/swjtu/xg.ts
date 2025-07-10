import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import InvalidParameterError from '@/errors/types/invalid-parameter';

const rootURL = 'http://xg.swjtu.edu.cn';
const listURL = {
    tzgg: `${rootURL}/web/Home/PushNewsList?Lmk7LJw34Jmu=010j.shtml`,
    yhxw: `${rootURL}/web/Home/NewsList?LJw34Jmu=011e.shtml`,
    dcxy: `${rootURL}/web/Home/ColourfulCollegeNewsList`,
    xgzj: `${rootURL}/web/Home/NewsList?xvw34vmu=010e.shtml`,
};

const getItem = (item, cache) => {
    const newsInfo = item.find('h4').find('a');
    const newsTime = item.find('span.ctxlist-time').text();
    const newsTitle = newsInfo.text();
    const link = `${rootURL}${newsInfo.attr('href')}`;
    return cache.tryGet(link, async () => {
        try {
            const resp = await got({
                method: 'get',
                url: link,
            });
            const $$ = load(resp.data);
            let newsText = $$('.detail-content-text').html();
            if (!newsText) {
                newsText = '转发通知';
            }
            return {
                title: newsTitle,
                pubDate: parseDate(String(newsTime)),
                link,
                description: newsText,
            };
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return {
                    title: newsTitle,
                    pubDate: parseDate(String(newsTime)),
                    link,
                    description: '',
                };
            } else {
                throw error;
            }
        }
    });
};

export const route: Route = {
    path: '/xg/:code?',
    categories: ['university'],
    example: '/swjtu/xg/tzgg',
    parameters: { code: '栏目(默认为tzgg)' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['xg.swjtu.edu.cn/web/Home/PushNewsList', 'xg.swjtu.edu.cn/web/Home/NewsList', 'xg.swjtu.edu.cn/web/Home/ColourfulCollegeNewsList', 'xg.swjtu.edu.cn/web/Publicity/List', 'xg.swjtu.edu.cn/'],
            target: '/xg',
        },
    ],
    name: '扬华素质网',
    maintainers: ['mobyw'],
    handler,
    url: 'xg.swjtu.edu.cn/web/Home/PushNewsList',
    description: `栏目列表：

| 通知公告 | 扬华新闻 | 多彩学院 | 学工之家 |
| -------- | -------- | -------- | -------- |
| tzgg     | yhxw     | dcxy     | xgzj     |`,
};

async function handler(ctx) {
    const code = ctx.req.param('code') ?? 'tzgg';
    const pageURL = listURL[code];

    if (!pageURL) {
        throw new InvalidParameterError('code not supported');
    }

    const resp = await got({
        method: 'get',
        url: pageURL,
    });

    const $ = load(resp.data);
    const list = $('div.right-side ul.block-ctxlist li');

    const items = await Promise.all(
        list.toArray().map((i) => {
            const item = $(i);
            return getItem(item, cache);
        })
    );

    return {
        title: '西南交大-扬华素质网',
        link: pageURL,
        item: items,
        allowEmpty: true,
    };
}
