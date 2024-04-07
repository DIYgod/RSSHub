import { Route } from '@/types';
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
    categories: ['traditional-media'],
    example: '/solidot/linux',
    parameters: { type: '消息类型。默认为 www. 在网站上方选择后复制子域名即可' },
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
    description: `:::tip
  Solidot 提供的 feed:

  -   [https://www.solidot.org/index.rss](https://www.solidot.org/index.rss)
  :::

  | 全部 | 创业    | Linux | 科学    | 科技       | 移动   | 苹果  | 硬件     | 软件     | 安全     | 游戏  | 书籍  | ask | idle | 博客 | 云计算 | 奇客故事 |
  | ---- | ------- | ----- | ------- | ---------- | ------ | ----- | -------- | -------- | -------- | ----- | ----- | --- | ---- | ---- | ------ | -------- |
  | www  | startup | linux | science | technology | mobile | apple | hardware | software | security | games | books | ask | idle | blog | cloud  | story    |`,
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
