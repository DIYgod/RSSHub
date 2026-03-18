import * as cheerio from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.tongli.com.tw/';
const listUrl = new URL('EpaperList.aspx', rootUrl).href;

const requestOptions = {
    headers: {
        'User-Agent': config.trueUA,
    },
};

export const route: Route = {
    path: '/epaper',
    categories: ['reading'],
    example: '/tongli/epaper',
    radar: [
        {
            source: ['www.tongli.com.tw/EpaperList.aspx'],
            target: '/epaper',
        },
    ],
    name: '电子报',
    maintainers: ['cokemine'],
    handler,
};

async function handler() {
    const { data: response } = await got(listUrl, requestOptions);
    const $ = cheerio.load(response);

    const items = $('#ContentPlaceHolder1_GridView1 a')
        .toArray()
        .flatMap((element) => {
            const anchor = $(element);
            const href = anchor.attr('href');

            if (!href) {
                return [];
            }

            return [
                {
                    title: anchor.text(),
                    link: new URL(href, rootUrl).href,
                },
            ];
        });

    const results = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link, requestOptions);
                const detailPage = cheerio.load(detailResponse);
                const dateText = detailPage('#ContentPlaceHolder1_Label1').text();
                const dateMatch = dateText.match(/(\d{4}\/\d{2}\/\d{2})/);

                return {
                    ...item,
                    description: buildDescription(detailPage),
                    pubDate: dateMatch ? parseDate(dateMatch[1], 'YYYY/MM/DD') : undefined,
                };
            })
        )
    );

    return {
        title: '東立出版社電子報',
        link: listUrl,
        item: results,
    };
}

const buildDescription = ($: cheerio.CheerioAPI) => {
    const panel = $('#ContentPlaceHolder1_Panel1').clone();

    if (panel.length === 0) {
        return '';
    }

    panel.find('script, style').remove();
    panel.find('#ContentPlaceHolder1_Label1').closest('tr').remove();
    panel.find('#ContentPlaceHolder1_Label2').closest('tr').remove();
    panel.find('#ContentPlaceHolder1_Label3').closest('tr').remove();
    panel.find('a[href="#top"]').remove();
    panel.find('a[href="#"]').remove();
    panel.find('font').each((_, element) => {
        const font = $(element);
        font.replaceWith(font.html() ?? '');
    });
    panel.find('*').each((_, element) => {
        const target = $(element);
        target.removeAttr('style');
        target.removeAttr('width');
        target.removeAttr('height');
        target.removeAttr('border');
        target.removeAttr('align');
        target.removeAttr('valign');
        target.removeAttr('bgcolor');
        target.removeAttr('cellpadding');
        target.removeAttr('cellspacing');
    });

    panel.find('img').each((_, element) => {
        const img = $(element);
        const src = img.attr('src');

        if (src) {
            img.attr('src', new URL(src, rootUrl).href);
        }
    });

    panel.find('a').each((_, element) => {
        const anchor = $(element);
        const href = anchor.attr('href');

        if (href && !href.startsWith('#') && !href.startsWith('javascript')) {
            anchor.attr('href', new URL(href, rootUrl).href);
        }
    });

    return panel.html() ?? '';
};
