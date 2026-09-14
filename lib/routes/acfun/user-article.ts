import { load } from 'cheerio';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const host = 'https://www.acfun.cn';

export const route: Route = {
    path: '/user/article/:uid',
    radar: [
        {
            source: ['www.acfun.cn/u/:id'],
            target: '/user/article/:id',
        },
    ],
    name: '用户文章',
    parameters: {
        uid: '用户 UID',
    },
    categories: ['anime'],
    example: '/acfun/user/article/1384329',
    view: ViewType.Articles,
    maintainers: ['tiaod'],
    handler,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const link = `${host}/u/${uid}`;
    const page = await ofetch(link);
    const $ = load(page);

    const username = $('#ac-space-info .name').first().text().trim();
    const description = $('.signature .complete').text();
    const image = $('head style:contains("user-photo")')
        .text()
        .match(/.user-photo\{\n\s*background:url\((.*)\) 0% 0% \/ 100% no-repeat;/)?.[1];

    const list = $('#ac-space-article-list .weblog-item')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $title = $item.find('a.title');
            const itemDate = $item
                .find('.info')
                .text()
                .match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0];

            return {
                title: $title.text(),
                link: `${host}${$title.attr('href')}`,
                pubDate: itemDate ? parseDate(itemDate, 'YYYY/MM/DD') : undefined,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const articlePage = await ofetch(item.link, {
                    headers: {
                        referer: link,
                    },
                });
                const $article = load(articlePage);
                const articleInfo = $article('.main script')
                    .text()
                    .match(/window\.articleInfo = (.*);\n\s*window.likeDomain/)![1];
                const data = JSON.parse(articleInfo);

                return {
                    ...item,
                    description: data.parts[0].content,
                    author: data.user?.name,
                    category: [...(data.channel?.name ? [data.channel.name] : []), ...(data.tagList ?? []).map((tag) => tag.name)],
                };
            })
        )
    );

    return {
        title: username ? `${username}的文章` : $('title').text(),
        link,
        description,
        image,
        item: items,
    };
}
