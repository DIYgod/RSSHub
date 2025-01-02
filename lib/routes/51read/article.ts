import { load } from 'cheerio';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import type { Route, DataItem } from '@/types';

export const route: Route = {
    path: '/article/:id',
    name: '章节',
    url: 'm.51read.org',
    maintainers: ['lazwa34'],
    example: '/51read/article/152685',
    parameters: { id: '小说 id, 可在对应小说页 URL 中找到' },
    categories: ['reading'],
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
            source: ['m.51read.org/xiaoshuo/:id'],
            target: '/article/:id',
        },
        {
            source: ['51read.org/xiaoshuo/:id'],
            target: '/article/:id',
        },
    ],
    handler,
};

async function handler(ctx) {
    const { id } = ctx.req.param();
    const link = `https://m.51read.org/xiaoshuo/${id}`;
    const $book = load(await ofetch(link));

    const chapter = `https://m.51read.org/zhangjiemulu/${id}`;
    const $chapter = load(await ofetch(chapter));

    const pageLength = $chapter('.ml-page select')
        .find('option')
        .toArray()
        .map((option) => option.attribs.value).length;

    const item = await createItem(chapter, pageLength);

    return {
        title: $book('h1').text(),
        description: $book('.bi-cot p').text(),
        link,
        item,
        image: $book('.bi-img img').attr('src'),
        author: $book('.bi-wt a').text(),
        language: 'zh-cn',
    };
}

const createItem = async (baseUrl: string, page: number) => {
    const url = `${baseUrl}/${page}`;
    const $latest = load(await ofetch(url));
    const item = await Promise.all(
        $latest('.kb-jp li>a')
            .toArray()
            .map((chapter) => buildItem(chapter.attribs.href))
            .toReversed()
    );
    return item;
};

const buildItem = (url: string) =>
    cache.tryGet(url, async () => {
        const $ = load(await ofetch(url));

        return {
            title: $('h1').text(),
            description: $('.kb-cot').html() || '',
            link: url,
        };
    }) as Promise<DataItem>;
