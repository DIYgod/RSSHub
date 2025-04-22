import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import path from 'node:path';
import { art } from '@/utils/render';

const domain = 'theblockbeats.info';
const rootUrl = `https://www.${domain}`;
const apiBase = `https://api.${domain}`;

const render = (data) => {
    const html = art(path.join(__dirname, 'templates/description.art'), data);
    const $ = load(html, null, false);

    $('img').each((_, e) => {
        const $e = $(e);
        const src = $e.attr('src');
        $e.attr('src', src?.split('?')[0]);
    });

    return $.html();
};

const channelMap = {
    newsflash: {
        title: '快讯',
        link: `${rootUrl}/newsflash`,
        api: `${apiBase}/v2/newsflash/list`,
    },
    article: {
        title: '文章',
        link: `${rootUrl}/article`,
        api: `${apiBase}/v2/article/list`,
    },
};

export const route: Route = {
    path: '/:channel?/:original?',
    categories: ['finance', 'popular'],
    view: ViewType.Articles,
    example: '/theblockbeats/newsflash',
    parameters: {
        channel: {
            description: '类型',
            options: [
                { value: 'newsflash', label: '快讯' },
                { value: 'article', label: '文章' },
            ],
            default: 'newsflash',
        },
        original: {
            description: '文章类型，仅 `channel` 为 `article` 时有效',
            options: [
                { value: '0', label: '全部' },
                { value: '1', label: '深度' },
                { value: '2', label: '精选' },
                { value: '3', label: '热点追踪' },
            ],
            default: '0',
        },
    },
    name: '新闻快讯',
    maintainers: ['Fatpandac', 'jameshih'],
    handler,
    radar: [
        {
            title: '文章',
            source: ['www.theblockbeats.info/article'],
            target: '/article',
        },
        {
            title: '快讯',
            source: ['www.theblockbeats.info/newsflash'],
            target: '/newsflash',
        },
    ],
    description: `|    快讯   |   文章  |
| :-------: | :-----: |
| newsflash | article |

| 全部 | 深度 | 精选 | 热点追踪 |
| :--: | :--: | :--: | :---: |
|     | -2  | 1    |  2     |`,
};

async function handler(ctx) {
    const { channel = 'newsflash', original } = ctx.req.param();

    const response = await ofetch(channelMap[channel].api, {
        query: {
            limit: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20,
            original: channel === 'article' ? original : undefined,
        },
    });

    let list = response.data.list.map((item) => ({
        title: item.title,
        link: `${rootUrl}/${channel === 'newsflash' ? 'flash' : 'news'}/${item.article_id}`,
        description: item.content ?? item.abstract,
        pubDate: parseDate(item.add_time, 'X'),
        author: item.author?.nickname,
        category: item.tag_list,
        imgUrl: item.img_url,
    }));

    if (channel !== 'newsflash') {
        list = await Promise.all(
            list.map((item) =>
                cache.tryGet(`theblockbeats:${item.link}`, async () => {
                    const response = await ofetch(item.link);
                    const $ = load(response);
                    item.description = render({
                        image: item.imgUrl,
                        description: $('div.news-content').html(),
                    });
                    return item;
                })
            )
        );
    }

    return {
        title: `TheBlockBeats - ${channelMap[channel].title}`,
        link: channelMap[channel].link,
        item: list,
    };
}
