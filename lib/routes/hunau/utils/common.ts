import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { categoryTitle } from './category-title';
import { indexPage } from './index-page';
import { newsContent } from './news-content';

function getCategory(department: string, category: string) {
    if (department === 'gfxy') {
        if (category === 'tzgg') {
            return 'tzgg_0';
        }
        if (category === 'xyxw') {
            return 'xyyw';
        }
    }
    if (department === 'jwc' && category === 'jwds') {
        return 'jwdt';
    }
    if (department === 'ied' && category === 'tzgg') {
        return 'ggtz';
    }
    return category;
}

export const getContent = async (
    ctx,
    {
        baseHost,
        baseCategory,
        baseType,
        baseTitle,
        baseDescription = '',
        baseDeparment = '',
        baseClass = 'div.article_list ul li:has(a)',
    }: { baseHost: string; baseCategory: string; baseType?: string; baseTitle: string; baseDescription?: string; baseDeparment?: string; baseClass?: string }
) => {
    const { category: requestedCategory = baseCategory, type = baseType } = ctx.req.param();
    const category = getCategory(baseDeparment, requestedCategory);

    const title = `${baseTitle} - ${categoryTitle(category)}`;
    const description = baseDescription ? `${baseDescription} - ${categoryTitle(category)}` : title;

    const typeURL = type ? `/${type}` : '';
    const baseURl = `${baseHost}${typeURL}/${category}`;
    const url = `${baseURl}/${indexPage()}`;

    const { data: response } = await got(url);
    const $ = load(response);

    const list = $(baseClass)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            const a = $item.find('a');
            const href = a.attr('href');
            const title = a.text();
            const link = new URL(href!, url).href;
            const date = ($item.find('.date').first().text() || $item.find('span').first().text()).replaceAll(/\s/g, '');
            const parsedDate = date ? parseDate(date, ['YYYY-MM-DD', 'YYYY年MM月DD日', 'YYYY/MM/DD'], true) : undefined;
            const pubDate = parsedDate && !Number.isNaN(parsedDate.getTime()) ? timezone(parsedDate, 8) : undefined;
            if (new URL(link).pathname.toLowerCase().endsWith('.pdf')) {
                return {
                    title,
                    link,
                    enclosure_url: link,
                    enclosure_type: 'application/pdf',
                    pubDate,
                };
            }

            return {
                title,
                link,
                pubDate,
            };
        });

    const items = await pMap<DataItem, DataItem>(
        list,
        async (item) => {
            if (item.enclosure_url) {
                return item;
            }
            const details = await cache.tryGet(item.link!, () => newsContent(item.link, baseDeparment));
            return { ...item, description: details.description, pubDate: details.pubDate || item.pubDate };
        },
        { concurrency: 3 }
    );

    return {
        // Feed title
        title,
        description,
        // Feed link
        link: url,
        // Feed items
        item: items,
    };
};
