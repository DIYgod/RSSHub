import { type Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';

const handler = async () => {
    const link = 'https://coolidge.org/about-us/news-media';
    const html = await ofetch(link);
    const $ = load(html);

    const container = $('#block-coolidge-content > div > div > div.view-content').first();
    const elements = container.find('div.news-item').toArray();

    const items = elements.map((el) => {
        const element = $(el);

        const titleEl = element.find('h2.news-item__title > a').first();
        const title = titleEl.text().trim();
        const href = titleEl.attr('href');
        const descriptionText = element.find('div.news-item__content > p').first().text().trim();
        const imageSrc = element.find('div.news-item__image img').first().attr('src');

        const absoluteLink = href ? new URL(href, link).href : undefined;
        const absoluteImage = imageSrc ? new URL(imageSrc, link).href : undefined;

        const rendered = art(path.join(__dirname, 'templates/description.art'), {
            image: absoluteImage,
            intro: descriptionText,
        });

        return {
            title,
            description: rendered,
            link: absoluteLink ?? link,
            guid: absoluteLink ?? absoluteImage ?? title,
        };
    });

    return {
        title: 'Coolidge Corner Theatre - News',
        link,
        description: 'News',
        item: items,
    };
};

export const route: Route = {
    path: '/news',
    name: 'News',
    url: 'coolidge.org/about-us/news-media',
    maintainers: ['johan456789'],
    example: '/coolidge/news',
    categories: ['blog'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    handler,
};
