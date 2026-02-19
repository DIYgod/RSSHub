import { load } from 'cheerio';
import markdownit from 'markdown-it';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

const md = markdownit({
    html: true,
    breaks: true,
});

export const route: Route = {
    path: '/weekly/:category?',
    categories: ['programming'],
    example: '/docschina/weekly',
    parameters: { category: '周刊分类，见下表，默认为js' },
    name: '周刊 - JavaScript',
    maintainers: ['daijinru', 'hestudy'],
    handler,
    description: `| javascript | node | react |
| ---------- | ---- | ----- |
| js         | node | react |`,
    radar: [
        {
            source: ['docschina.org/news/weekly/js/*', 'docschina.org/news/weekly/js', 'docschina.org/'],
            target: '/jsweekly',
        },
    ],
};

async function handler(ctx) {
    const { category = 'js' } = ctx.req.param();

    const baseURL = 'https://docschina.org';
    const path = `/news/weekly/${category}`;
    const url = `${baseURL}${path}`;
    const { data: res } = await got(url);
    // @ts-ignore
    const $ = load(res);

    const title = $('head title').text();
    const dataEl = $('#__NEXT_DATA__');
    const dataText = dataEl.text();
    const data = JSON.parse(dataText);
    const items = await Promise.all(
        data?.props?.pageProps?.data?.slice(0, 10).map((item) => {
            const link = `${url}/${item.issue}`;
            return cache.tryGet(link, async () => {
                const { data: response } = await got(`${baseURL}/_next/data/${data.buildId}/news/weekly/js/${item.issue}.json`);
                return {
                    title: item.title,
                    description: md.render(response.pageProps.content),
                    link,
                    author: item.editors?.join(','),
                    itunes_item_image: item.imageUrl,
                };
            });
        }) || {}
    );

    return {
        title,
        link: url,
        item: items,
    };
}
