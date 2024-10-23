import { Route } from '@/types';

import got from '@/utils/got';
import { load } from 'cheerio';
import iconv from 'iconv-lite';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx) => {
    const { tag } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const rootUrl = 'https://news.10jqka.com.cn';
    const apiUrl = new URL('tapp/news/push/stock', rootUrl).href;
    const currentUrl = new URL('realtimenews.html', rootUrl).href;

    const { data: currentResponse } = await got(currentUrl, {
        responseType: 'buffer',
    });

    const $ = load(iconv.decode(currentResponse, 'gbk'));

    const language = $('html').prop('lang');

    const { data: response } = await got(apiUrl, {
        searchParams: {
            page: 1,
            tag: tag ?? '',
        },
    });

    const items =
        response.data?.list.slice(0, limit).map((item) => {
            const title = item.title;
            const description = item.digest;
            const guid = `10jqka-${item.seq}`;
            const image = item.picUrl;

            return {
                title,
                description,
                pubDate: parseDate(item.ctime, 'X'),
                link: item.url,
                category: [...new Set([item.color === '2' ? '重要' : undefined, ...item.tags.map((c) => c.name), ...item.tagInfo.map((c) => c.name)])].filter(Boolean),
                author: item.source,
                guid,
                id: guid,
                content: {
                    html: description,
                    text: description,
                },
                image,
                banner: item.picUrl,
                updated: parseDate(item.rtime, 'X'),
                language,
            };
        }) ?? [];

    const title = $('title').text();
    const image = $('h1 a img').prop('src');

    return {
        title,
        description: title.split(/_/).pop(),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: $('meta[property="og:site_name"]').prop('content'),
        language,
    };
};

export const route: Route = {
    path: '/realtimenews/:tag?',
    name: '7×24小时要闻直播',
    url: 'news.10jqka.com.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/10jqka/realtimenews',
    parameters: { tag: '标签，默认为全部' },
    description: `:::tip
  若订阅 [7×24小时要闻直播](https://news.10jqka.com.cn/realtimenews.html) 的 \`公告\` 标签。将 \`公告\` 作为标签参数填入，此时路由为 [\`/10jqka/realtimenews/公告\`](https://rsshub.app/10jqka/realtimenews/公告)。
  
  若订阅 [7×24小时要闻直播](https://news.10jqka.com.cn/realtimenews.html) 的 \`公告\` 和 \`A股\` 标签。将 \`公告,A股\` 作为标签参数填入，此时路由为 [\`/10jqka/realtimenews/公告,A股\`](https://rsshub.app/10jqka/realtimenews/公告,A股)。
  :::

  | 全部 | 重要 | A股 | 港股 | 美股 | 机会 | 异动 | 公告 |
  | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
    `,
    categories: ['finance'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            title: '全部',
            source: ['news.10jqka.com.cn/realtimenews.html'],
            target: '/realtimenews/全部',
        },
        {
            title: '重要',
            source: ['news.10jqka.com.cn/realtimenews.html'],
            target: '/realtimenews/重要',
        },
        {
            title: 'A股',
            source: ['news.10jqka.com.cn/realtimenews.html'],
            target: '/realtimenews/A股',
        },
        {
            title: '港股',
            source: ['news.10jqka.com.cn/realtimenews.html'],
            target: '/realtimenews/港股',
        },
        {
            title: '美股',
            source: ['news.10jqka.com.cn/realtimenews.html'],
            target: '/realtimenews/美股',
        },
        {
            title: '机会',
            source: ['news.10jqka.com.cn/realtimenews.html'],
            target: '/realtimenews/机会',
        },
        {
            title: '异动',
            source: ['news.10jqka.com.cn/realtimenews.html'],
            target: '/realtimenews/异动',
        },
        {
            title: '公告',
            source: ['news.10jqka.com.cn/realtimenews.html'],
            target: '/realtimenews/公告',
        },
    ],
};
