import * as cheerio from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.tongli.com.tw/';

const requestOptions = {
    headers: {
        'User-Agent': config.trueUA,
    },
};

export const route: Route = {
    path: '/novel',
    categories: ['reading'],
    example: '/tongli/novel',
    radar: [
        {
            source: ['www.tongli.com.tw/NovelDetail.aspx'],
            target: '/novel',
        },
    ],
    name: '小说',
    maintainers: ['cokemine'],
    handler,
};

async function handler() {
    const listUrl = new URL('NovelDetail.aspx', rootUrl);
    listUrl.searchParams.set('page', '1');
    listUrl.searchParams.set('s', '1');

    const { data: response } = await got(listUrl.href, requestOptions);
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
        title: '東立出版社小說新書上架',
        link: listUrl.href,
        item: items,
    };
}
