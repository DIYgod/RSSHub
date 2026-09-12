import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/:type?',
    categories: ['multimedia'],
    example: '/zimuku/mv',
    parameters: { type: '类型, 默认为 `mv` 电影' },
    name: '字幕列表',
    maintainers: ['sanmmm'],
    description: `类型

| 最新电影 | 最新美剧 |
| -------- | -------- |
| mv       | tv       |`,
    handler,
};

const typeToLabel = {
    mv: '电影字幕',
    tv: '美剧字幕',
};

async function handler(ctx: Context) {
    const { type = 'mv' } = ctx.req.param();
    const baseUrl = 'https://zimuku.org';
    const url = `${baseUrl}/newsubs?t=${type}`;

    const response = await ofetch(url);
    const $ = load(response);

    const items = $('table > tbody > tr')
        .toArray()
        .map((ele) => {
            const $item = $(ele);
            const author = $item.find('.glyphicon-user').text();
            const baseInfoNode = $item.find('.first > a');
            const langs = $item
                .find('.lang > img')
                .toArray()
                .map((img) => $(img).attr('title')!.replace('字幕', ''));
            return {
                title: baseInfoNode.attr('title') ?? '',
                link: `${baseUrl}${baseInfoNode.attr('href')}`,
                author,
                description: `语言: ${langs.join(' | ')}`,
            };
        });

    const title = `字幕库 - ${typeToLabel[type]}`;

    return {
        title,
        description: title,
        link: url,
        item: items,
    };
}
