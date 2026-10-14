import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/',
    categories: ['reading'],
    example: '/medieval-china',
    radar: [
        {
            source: ['medieval-china.club/'],
            target: '',
        },
    ],
    name: '首页',
    maintainers: ['artefaritaKuniklo'],
    handler,
    url: 'medieval-china.club/',
};

async function handler(ctx) {
    const baseUrl = 'https://medieval-china.club';
    const { data: response } = await got(baseUrl);
    const $ = load(response);
    const sourcePosts: Array<{ title: string; path: string; date: string }> = JSON.parse(
        $('script:contains("window.localPosts")')
            .text()
            .match(/window\.localPosts = JSON\.parse\('(.*)'\);/)![1]
    );
    const posts: Array<DataItem & { link: string }> = sourcePosts.slice(0, getRouteLimit(ctx, 10)).map((item) => ({
        title: item.title,
        link: `${baseUrl}${item.path}`,
        pubDate: item.date ? timezone(parseDate(item.date), 8) : undefined,
    }));
    const items = await pMap(
        posts,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`medieval-china:body:${item.link}`, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                $('img').each((_, image) => {
                    const $image = $(image);
                    const imageSource = $image.attr('data-original') ?? $image.attr('src');
                    if (imageSource) {
                        $image.attr('src', new URL(imageSource, item.link).href);
                    }
                });
                $('.head-mask').remove();
                $('div.lover-box').remove();
                return { description: $('article').first().html() };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: '中国的中古',
        link: baseUrl,
        item: items,
        image: 'https://medieval-china.club/images/icons/favicon-144x144.png',
        description:
            '世界那么大，你无法去到每一个地方，感受每一处风景；时间那么长，那些逝去的人你也终将无法与之谋面。而通过古人之文字，今人之分享，你可以领略以前风光之奇绝瑰玮，感受逝人之人情冷暖。中古就是这么一个地方，大家来自全球各地，不同时区，不同性别，不同身份，不同职业，但是大家都被中古的绚烂华章聚集在一起，哀其所哀，乐其所乐。这是一个虚拟的世界，但是我们仿佛跨越千里而来，谈一场绝世爱恋，今夕何夕！仅以此网站献给中古club的每一位成员，契阔谈宴，西园不芜！',
    };
}
