import { type CheerioAPI, load } from 'cheerio';
import LZString from 'lz-string';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

const getChapters = ($: CheerioAPI, baseUrl: string, latestChapterLink?: string, updateDate?: Date) => {
    const result: Array<{ link: string; title?: string; pubDate?: Date; num: string; category: string; isNew: boolean }> = [];
    $('h4').each((_, ele) => {
        const categoryName = $(ele).text();
        let nextEle = ele.next;
        while (nextEle && !$(nextEle).hasClass('chapter-list')) {
            nextEle = nextEle.next;
        }
        if (!nextEle) {
            return;
        }
        for (const ul of $(nextEle).children('ul').toArray().toReversed()) {
            for (const li of $(ul).children('li').toArray()) {
                const a = $(li).children('a');
                const link = new URL(a.attr('href')!, baseUrl).href;
                result.push({
                    link,
                    title: a.attr('title'),
                    pubDate: link === latestChapterLink ? updateDate : undefined,
                    num: a.find('i').text(),
                    category: categoryName,
                    isNew: a.find('em').length > 0,
                });
            }
        }
    });
    return result.toSorted((a, b) => Number(b.isNew) - Number(a.isNew));
};

export const route: Route = {
    path: ['/comic/:id/:chapterCnt?', '/:domain?/comic/:id/:chapterCnt?'],
    categories: ['anime'],
    example: '/manhuagui/comic/22942/5',
    parameters: { id: '漫画ID', chapterCnt: '返回章节的数量，默认为0，返回所有章节', domain: '域名，可选 mhgui、twmanhuagui；不填或其他值默认使用 www.manhuagui.com' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['www.mhgui.com/comic/:id/'],
            target: '/comic/:id',
        },
    ],
    name: '漫画更新',
    maintainers: ['MegrezZhu'],
    handler,
};

async function handler(ctx) {
    const { id, domain } = ctx.req.param();
    const baseUrl = domain === 'mhgui' ? 'https://www.mhgui.com' : domain === 'twmanhuagui' ? 'https://tw.manhuagui.com' : 'https://www.manhuagui.com';

    const chapterCnt = Number(ctx.req.param('chapterCnt') || 0);
    const { data } = await got(`${baseUrl}/comic/${id}/`);
    const $ = load(data);

    const viewState = $('#__VIEWSTATE').attr('value');
    if (viewState) {
        const n = LZString.decompressFromBase64(viewState);
        if (n) {
            $('#erroraudit_show').replaceWith(n);
            $('#__VIEWSTATE').remove();
        }
    }

    const bookTitle = $('.book-title > h1').text();
    const bookIntro = $('#intro-all').text();
    // Return the source notice for unavailable manga.
    if ($('.status > span').text().includes('已下架')) {
        return {
            title: `看漫画 - ${bookTitle} 已下架`,
            link: `${baseUrl}/comic/${id}/`,
            description: bookIntro,
            item: [{ link: `${baseUrl}/comic/${id}/`, title: bookTitle, description: '已下架' }],
        };
    }
    const coverImgSrc = $('.book-cover img').attr('src');
    const updateStatus = $('.status > span')
        .filter((_, element) => /最近[于於]/.test($(element).text()))
        .first();
    const dateText = updateStatus.text().match(/最近[于於]\s*\[([^\]]+)\]/)?.[1];
    const updateDate = dateText ? parseDateInTimezone(dateText, 0) : undefined;
    const latestChapterHref = updateStatus.find('a').attr('href');
    const latestChapterLink = latestChapterHref ? new URL(latestChapterHref, baseUrl).href : undefined;
    const chapters = getChapters($, baseUrl, latestChapterLink, updateDate);
    const newChapterCnt = chapters.filter((chapter) => chapter.isNew).length;
    const genResult = (chapter) => ({
        link: chapter.link,
        title: chapter.title,
        pubDate: chapter.pubDate,
        category: chapter.category,
        description: `
            <h1>${chapter.num}</h1>
            <img src='${coverImgSrc}' />
        `.trim(),
    });
    const items = chapters.map((element) => genResult(element));
    let itemsLen = items.length;
    if (chapterCnt > 0) {
        itemsLen = Math.max(chapterCnt, newChapterCnt);
    }

    return {
        title: `看漫画 - ${bookTitle}`,
        link: `${baseUrl}/comic/${id}/`,
        description: bookIntro,
        item: items.slice(0, itemsLen),
    };
}
