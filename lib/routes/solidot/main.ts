import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
// Warning: The author still knows nothing about javascript!

// params:
// type: subject type

import got from '@/utils/got'; // get web content
import { load } from 'cheerio'; // html parser
import get_article from './_article';
import { isValidHost } from '@/utils/valid-host';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/:type?',
    categories: ['traditional-media', 'popular'],
    view: ViewType.Articles,
    example: '/solidot/linux',
    parameters: {
        type: {
            description: '消息类型，在网站上方选择后复制子域名或参见 [https://www.solidot.org/index.rss](https://www.solidot.org/index.rss) 即可',
            options: [
                { value: 'www', label: '全部' },
                { value: 'startup', label: '创业' },
                { value: 'linux', label: 'Linux' },
                { value: 'science', label: '科学' },
                { value: 'technology', label: '科技' },
                { value: 'mobile', label: '移动' },
                { value: 'apple', label: '苹果' },
                { value: 'hardware', label: '硬件' },
                { value: 'software', label: '软件' },
                { value: 'security', label: '安全' },
                { value: 'games', label: '游戏' },
                { value: 'books', label: '书籍' },
                { value: 'ask', label: 'ask' },
                { value: 'idle', label: 'idle' },
                { value: 'blog', label: '博客' },
                { value: 'cloud', label: '云计算' },
                { value: 'story', label: '奇客故事' },
            ],
            default: 'www',
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
    name: '最新消息',
    maintainers: ['sgqy', 'hang333', 'TonyRL'],
    handler,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'www';
    if (!isValidHost(type)) {
        throw new InvalidParameterError('Invalid type');
    }

    const base_url = `https://${type}.solidot.org`;
    const response = await got({
        method: 'get',
        url: base_url,
    });
    const data = response.data; // content is html format
    const $ = load(data);

    // get urls
    const a = $('div.block_m').find('div.bg_htit > h2 > a');
    const urls = [];
    for (const element of a) {
        urls.push($(element).attr('href'));
    }

    // get articles
    const msg_list = await Promise.all(urls.map((u) => cache.tryGet(u, () => get_article(u))));

    // feed the data
    return {
        title: '奇客的资讯，重要的东西',
        link: base_url,
        item: msg_list,
    };
}
