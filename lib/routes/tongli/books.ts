import * as cheerio from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.tongli.com.tw/';
const newComicUrl = new URL('webpagebooks.aspx?page=1&s=1', rootUrl).href;
const scheduleUrl = new URL('Search1.aspx?Page=1', rootUrl).href;
const rankingUrl = new URL('search3.aspx', rootUrl).href;
const detailUrl = (bookId: string) => new URL(`BooksDetail.aspx?Bd=${bookId}`, rootUrl).href;

const requestOptions = {
    headers: {
        'User-Agent': config.trueUA,
    },
};

export const route: Route = {
    path: '/books/:section',
    categories: ['reading'],
    example: '/tongli/books/comic-new',
    parameters: {
        section: 'comic-new | schedule | ranking',
    },
    radar: [
        {
            source: ['www.tongli.com.tw/webpagebooks.aspx'],
            target: '/books/comic-new',
        },
        {
            source: ['www.tongli.com.tw/Search1.aspx'],
            target: '/books/schedule',
        },
        {
            source: ['www.tongli.com.tw/search3.aspx'],
            target: '/books/ranking',
        },
    ],
    name: '出版品',
    description: '東立出版社出版品新書、預定出書與暢銷排行',
    maintainers: ['cokemine'],
    handler,
};

function handler(ctx) {
    const { section } = ctx.req.param();

    if (section === 'comic-new') {
        return fetchNewBooks(newComicUrl, '漫畫新書上架');
    }

    if (section === 'schedule') {
        return fetchSchedule();
    }

    if (section === 'ranking') {
        return fetchRanking();
    }

    throw new Error(`Invalid section: ${section}. Use comic-new, schedule, or ranking.`);
}

const fetchNewBooks = async (listUrl: string, title: string) => {
    const { data: response } = await got(listUrl, requestOptions);
    const $ = cheerio.load(response);

    const list = $('.package_list .b_package')
        .toArray()
        .flatMap((element) => {
            const item = $(element);
            const link = item.find('.pk_img a').attr('href');
            const image = item.find('.pk_img img').attr('src');
            const bookTitle = item.find('.pk_txt em').first().text();
            const volume = item.find('.pk_txt span').last().text();

            if (!link || !bookTitle) {
                return [];
            }

            return [
                {
                    title: [bookTitle, volume].filter(Boolean).join(' '),
                    link: new URL(link, rootUrl).href,
                    author: item.find('.pk_txt span').first().text(),
                    image: image ? new URL(image, rootUrl).href : undefined,
                },
            ];
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link, requestOptions);
                const detailPage = cheerio.load(detailResponse);

                const cover = detailPage('#ContentPlaceHolder1_Image1').attr('src');
                const description = detailPage('#ContentPlaceHolder1_Description').html() ?? '';
                const categoryText = detailPage('#ContentPlaceHolder1_ReaderTxt').text();
                const pubDateText = detailPage('#ContentPlaceHolder1_UplineDate').text();

                return {
                    ...item,
                    description,
                    category: categoryText ? [categoryText.trim()] : undefined,
                    pubDate: pubDateText ? parseDate(pubDateText.trim(), 'YYYY/M/D') : undefined,
                    image: cover ? new URL(cover, rootUrl).href : item.image,
                };
            })
        )
    );

    return {
        title: `東立出版社${title}`,
        link: listUrl,
        item: items,
    };
};

const fetchSchedule = async () => {
    const { data: response } = await got(scheduleUrl, requestOptions);
    const $ = cheerio.load(response);

    const monthRange = $('#ContentPlaceHolder1_DataMonth').text();
    const heading = $('.sdBook_t').text().trim();

    const rows = $('.Form_sb tr')
        .toArray()
        .flatMap((element, rowIndex) => {
            const row = $(element);
            const cells = row.find('td').toArray();

            if (cells.length === 0 || !$(cells[0]).attr('data-th')) {
                return [];
            }

            const columns = cells.map((cell) => $(cell).text().trim());
            const title = columns[0];
            const author = columns[1];
            const category = columns[2];
            const size = columns[3];
            const price = columns[4];
            const note = columns[5];

            if (!title) {
                return [];
            }

            const descriptionParts = [size ? `開數：${size}` : '', price ? `定價：${price}` : '', note ? `備註：${note}` : ''].filter(Boolean);

            return [
                {
                    title,
                    link: `${scheduleUrl}#row-${rowIndex + 1}`,
                    author,
                    category: category ? [category] : undefined,
                    description: descriptionParts.join('<br>'),
                    guid: `tongli-schedule-${rowIndex + 1}`,
                },
            ];
        });

    return {
        title: `東立出版社預定出書${monthRange ? ` ${monthRange}月` : ''}`,
        link: scheduleUrl,
        item: rows,
        description: heading,
    };
};

const fetchRanking = async () => {
    const { data: response } = await got(rankingUrl, requestOptions);
    const $ = cheerio.load(response);

    const tabs = [
        { id: '#tab1', label: '少年漫畫' },
        { id: '#tab2', label: '少女漫畫' },
        { id: '#tab3', label: '小說' },
    ];

    const items = tabs.flatMap((tab) => {
        const root = $(tab.id);
        const entries = root.find('input[onclick*="BooksDetail.aspx?Bd="]');

        return entries.toArray().flatMap((element) => {
            const input = $(element);
            const onclick = input.attr('onclick') ?? '';
            const match = onclick.match(/BooksDetail\.aspx\?Bd=([A-Za-z0-9]+)/);

            if (!match) {
                return [];
            }

            const bookId = match[1];
            const image = input.attr('src');

            return [
                {
                    bookId,
                    category: tab.label,
                    image: image ? new URL(image, rootUrl).href : undefined,
                },
            ];
        });
    });

    const results = await Promise.all(
        items.map((item) =>
            cache.tryGet(detailUrl(item.bookId), async () => {
                const detailLink = detailUrl(item.bookId);
                const { data: detailResponse } = await got(detailLink, requestOptions);
                const detailPage = cheerio.load(detailResponse);

                const title = detailPage('#ContentPlaceHolder1_CBookName').text();
                const author = detailPage('#ContentPlaceHolder1_AuthorName').text();
                const description = detailPage('#ContentPlaceHolder1_Description').html() ?? '';
                const cover = detailPage('#ContentPlaceHolder1_Image1').attr('src');

                return {
                    title: title || item.bookId,
                    link: detailLink,
                    author: author || undefined,
                    description,
                    category: [item.category],
                    image: cover ? new URL(cover, rootUrl).href : item.image,
                };
            })
        )
    );

    return {
        title: '東立出版社暢銷排行',
        link: rankingUrl,
        item: results,
    };
};
