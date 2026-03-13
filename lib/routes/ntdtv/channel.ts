import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://www.ntdtv.com';

export const route: Route = {
    path: '/:language/:id',
    categories: ['traditional-media'],
    example: '/ntdtv/b5/prog1201',
    parameters: { language: '语言，简体为`gb`，繁体为`b5`', id: '子频道名称' },
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
            source: ['www.ntdtv.com/:language/:id'],
        },
    ],
    name: '频道',
    maintainers: ['Fatpandac'],
    handler,
    description: `参数均可在官网获取，如：

  \`https://www.ntdtv.com/b5/prog1201\` 对应 \`/ntdtv/b5/prog1201\``,
};

async function handler(ctx) {
    const language = ctx.req.param('language');
    const id = ctx.req.param('id');
    const url = `${host}/${language}/${id}`;

    const response = await got(url);
    const $ = load(response.data);
    const title = $('h1.block_title').text();
    const list = $('div.list_wrapper > div')
        .toArray()
        .map((item) => ({
            title: $(item).find('div.title').text(),
            link: $(item).find('div.title > a').attr('href'),
            description: $(item).find('div.excerpt').text(),
        }))
        .filter((item) => item.link);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got.get(item.link);
                const content = load(detailResponse.data);

                item.description = content('div.post_content').html();
                item.pubDate = timezone(parseDate(content('div.time > span').text()), +8);

                return item;
            })
        )
    );

    return {
        title: `新唐人电视台 - ${title}`,
        link: url,
        item: items,
    };
}
