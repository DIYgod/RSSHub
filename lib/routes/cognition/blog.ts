import { load } from 'cheerio';

import { type Data, type DataItem, type Route, ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    name: 'Blog',
    url: 'cognition.ai/blog',
    maintainers: ['Loongphy'],
    example: '/cognition/blog',
    categories: ['programming'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['cognition.ai/blog/1'],
            target: '/blog',
        },
    ],
    view: ViewType.Articles,
    handler,
};

const splitAuthors = (text: string | undefined): DataItem['author'] => {
    if (!text) {
        return undefined;
    }

    const names = text
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean);

    if (names.length === 0) {
        return undefined;
    }

    return names.map((name) => ({
        name,
    }));
};

export async function handler(): Promise<Data> {
    const baseUrl = 'https://cognition.ai';
    const listPath = '/blog/1';
    const targetUrl = new URL(listPath, baseUrl).href;
    const html = await ofetch(targetUrl);
    const $ = load(html);

    const items = $('#blog-post-list__list li.blog-post-list__list-item')
        .toArray()
        .map((el) => {
            const element = $(el);
            const linkElement = element.find('a.o-blog-preview').first();

            const href = linkElement.attr('href');
            const link = href ? new URL(href, baseUrl).href : undefined;

            if (!link) {
                return;
            }

            const title = linkElement.find('h3.o-blog-preview__title').text().trim();
            if (!title) {
                return;
            }

            const summary = linkElement.find('p.o-blog-preview__intro').text().trim();

            const dateNode = linkElement.find('.o-blog-preview__meta-date').clone();
            dateNode.find('.o-blog-preview__meta').remove();
            const dateText = dateNode.text().trim();
            const authorText = linkElement.find('.o-blog-preview__meta-author').text().trim();

            const dataItem: DataItem = {
                title,
                link,
                pubDate: parseDate(dateText),
            };

            if (summary) {
                dataItem.description = summary;
            }

            const authors = splitAuthors(authorText);
            if (authors) {
                dataItem.author = authors;
            }

            return dataItem;
        })
        .filter((item): item is DataItem => item !== undefined);

    const imageAttr = $('meta[property="og:image"]').attr('content');
    const image = imageAttr ? new URL(imageAttr, baseUrl).href : undefined;

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        allowEmpty: true,
        item: items,
        image,
    };
}
