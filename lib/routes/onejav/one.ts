import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/:type/:key?',
    categories: ['multimedia'],
    example: '/onejav/popular/30',
    parameters: { type: '类型', key: '关键词' },
    features: {
        antiCrawler: true,
        supportBT: true,
        nsfw: true,
    },
    radar: [
        {
            title: '页面种子',
            source: ['onejav.com/:type', 'onejav.com/:type/:key', 'onejav.com/:type/:key/:morekey'],
            target: (params) => {
                const itype = params.morekey === undefined ? params.type : params.type === 'tag' ? 'tag' : 'day';
                const ikey = `${itype === 'day' ? params.type : ''}${params.key || ''}${itype === 'tag' && params.morekey !== undefined ? '%2F' : ''}${params.morekey || ''}`;
                return `/onejav/${itype}/${ikey}`;
            },
        },
    ],
    name: 'OneJAV BT',
    maintainers: ['monsterxcn'],
    handler,
    description: `**类型**

| 最新 | 热门    | 随机   | 指定演员 | 指定标签 | 指定日期 |
| ---- | ------- | ------ | -------- | -------- | -------- |
| new  | popular | random | actress  | tag      | day      |

**关键词**

| 空 | 日期范围    | 演员名       | 标签名         | 日期     |
| -- | ----------- | ------------ | -------------- | -------- |
|    | 7 / 30 / 60 | Yua%20Mikami | Adult%20Awards | YYYYMMDD |

**示例说明**

- \`/onejav/new\`

  仅当类型为 \`new\` \`popular\` 或 \`random\` 时关键词可为 **空**

- \`/onejav/popular/30\`

  \`popular\` \`random\` 类型的关键词可填写 \`7\` \`30\` 或 \`60\` 三个 **日期范围** 之一

- \`/onejav/actress/Yua%20Mikami\`

  \`actress\` 类型的关键词必须填写 **演员名** ，可在 [此处](https://onejav.com/actress/) 演员单页链接中获取

- \`/onejav/tag/Adult%20Awards\`

  \`tag\` 类型的关键词必须填写 **标签名** 且标签中的 \`/\` 必须替换为 \`%2F\` ，可在 [此处](https://onejav.com/tag/) 标签单页链接中获取

- \`/onejav/day/20200730\`

  \`day\` 类型的关键词必须填写 **日期** ，按照示例写成形如 \`20200730\` 的格式`,
};

const rootUrl = 'https://onejav.com';

async function handler(ctx: Context) {
    const { type } = ctx.req.param();
    const rawKey = ctx.req.param('key') ?? '';
    const key = type === 'day' ? `${rawKey.slice(0, 4)}/${rawKey.slice(4, 6)}/${rawKey.slice(6, 8)}` : rawKey;
    const link = rootUrl + `/${type === 'day' ? '' : type}${type === 'new' ? '' : `/${key}`}`.replace('//', '/');

    const response = await ofetch(link);

    const $ = load(response);

    return {
        title: `OneJAV - ${type} ${key}`,
        link,
        item: $('div.columns')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const $title = $item.find('div.card-content.is-flex > h5 > a');

                return {
                    title: `【${$title.text()}】${$item.find('div.card-content.is-flex > h5 > span').text()}`,
                    description: `<img src="${$item.find('img').attr('src')}"/><br/>Time: ${$item.find('p.subtitle.is-6 > a').text()}<br/>Desc: ${$item.find('p.level.has-text-grey-dark').text()}`,
                    link: $title.attr('href'),
                    category: $item
                        .find('.tag')
                        .toArray()
                        .map((tag) => $(tag).text().trim()),
                    enclosure_url: `${rootUrl}${$item.find('p.control.is-expanded > a').attr('href')}`,
                    enclosure_type: 'application/x-bittorrent',
                };
            }),
    };
}
