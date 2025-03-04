import { DataItem, Route } from '@/types';

import { config } from '@/config';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

// test url http://localhost:1200/asianfanfics/tag/milklove/N

export const route: Route = {
    path: '/tag/:tag/:type',
    categories: ['reading'],
    example: '/asianfanfics/tag/milklove/N',
    parameters: {
        tag: '标签',
        type: '排序类型',
    },
    name: '标签',
    maintainers: ['KazooTTT'],
    radar: [
        {
            source: ['www.asianfanfics.com/browse/tag/:tag/:type'],
            target: '/tag/:tag/:type',
        },
    ],
    description: `匹配asianfanfics标签，支持排序类型：
- L: Latest 最近更新
- N: Newest 最近发布
- O: Oldest 最早发布
- C: Completed 已完成
- OS: One Shots 短篇
`,
    handler,
};

type Type = 'L' | 'N' | 'O' | 'C' | 'OS';

const typeToText = {
    L: '最近更新',
    N: '最近发布',
    O: '最早发布',
    C: '已完成',
    OS: '短篇',
};

async function handler(ctx) {
    const tag = ctx.req.param('tag');
    const type = ctx.req.param('type') as Type;

    if (!type || !['L', 'N', 'O', 'C', 'OS'].includes(type)) {
        throw new Error('无效的排序类型');
    }
    const link = `https://www.asianfanfics.com/browse/tag/${tag}/${type}`;

    const response = await ofetch(link, {
        headers: {
            'user-agent': config.trueUA,
            Referer: 'https://www.asianfanfics.com/',
        },
    });
    const $ = load(response);

    const items: DataItem[] = $('.primary-container .excerpt')
        .toArray()
        .filter((element) => {
            const $element = $(element);
            return $element.find('.excerpt__title a').length > 0;
        })
        .map((element) => {
            const $element = $(element);
            const title = $element.find('.excerpt__title a').text();
            const link = 'https://www.asianfanfics.com' + $element.find('.excerpt__title a').attr('href');
            const author = $element.find('.excerpt__meta__name a').text().trim();
            const pubDate = parseDate($element.find('time').attr('datetime') || '');

            return {
                title,
                link,
                author,
                pubDate,
            };
        });

    return {
        title: `Asianfanfics - 标签：${tag} - ${typeToText[type]}`,
        link,
        item: items,
    };
}
