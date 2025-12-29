import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import iconv from 'iconv-lite';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

const baseUrl = 'https://www.cartoonmad.com';
const KEY = '5e585';

const renderChapterImage = (url: string) => renderToString(<ChapterImage url={url} />);

const ChapterImage = ({ url }: { url: string }) => (
    <>
        <img src={url} />
        <br />
    </>
);

const loadContent = (id, { chapter, pages }) => {
    let description = '';
    for (let page = 1; page <= pages; page++) {
        const url = `${baseUrl}/${KEY}/${id}/${chapter}/${String(page).padStart(3, '0')}.jpg`;
        description += renderChapterImage(url);
    }
    return description;
};

const getChapters = (id, list, tryGet) =>
    Promise.all(
        list.map((item) =>
            tryGet(item.link, () => {
                item.description = loadContent(id, item);

                return item;
            })
        )
    );

export const route: Route = {
    path: '/comic/:id',
    categories: ['anime'],
    example: '/cartoonmad/comic/5827',
    parameters: { id: '漫画ID' },
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
            source: ['cartoonmad.com/comic/:id'],
        },
    ],
    name: '漫画更新',
    maintainers: ['KellyHwong'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const link = `${baseUrl}/comic/${id}`;

    const { data } = await got(link, {
        responseType: 'buffer',
        headers: {
            Referer: 'https://www.cartoonmad.com/',
        },
    });
    const content = iconv.decode(data, 'big5');
    const $ = load(content);

    const bookIntro = $('#info').eq(0).find('td').text().trim();
    // const coverImgSrc = $('.cover').parent().find('img').attr('src');
    const list = $('#info')
        .eq(1)
        .find('a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${baseUrl}${item.attr('href')}`,
                chapter: item.text().match(/\d+/)[0],
                pages: item.next('font').text().match(/\d+/)[0],
            };
        })
        .toReversed();

    const chapters = await getChapters(id, list, cache.tryGet);

    return {
        title: $('head title').text(),
        link,
        description: bookIntro,
        item: chapters,
    };
}
