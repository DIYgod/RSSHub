import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

import { renderDescription } from './templates/description';

const host = 'https://techcrunch.com';
export const route: Route = {
    path: '/news',
    categories: ['new-media'],
    example: '/techcrunch/news',
    parameters: {},
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
            source: ['techcrunch.com/'],
        },
    ],
    name: 'News',
    maintainers: ['IvanWng97'],
    handler,
    url: 'techcrunch.com/',
};

async function handler() {
    const { data } = await got(`${host}/wp-json/wp/v2/posts`);
    const items = data.map((item) => {
        const head = item.yoast_head_json;
        const article = head.schema?.['@graph']?.find((node) => node['@type'] === 'NewsArticle');
        const date = item.date_gmt || head.article_published_time;
        const $ = load(item.content.rendered, null, false);
        $('.wp-block-techcrunch-inline-cta').remove();
        return {
            title: item.title.rendered,
            description: renderDescription({
                head,
                rendered: $.html(),
            }),
            link: item.link,
            pubDate: date ? parseDateInTimezone(date, 0) : undefined,
            author: head.author,
            category: [...new Set<string>([...(article?.articleSection ?? []), ...(article?.keywords ?? [])])].map((category) => $('<span>').html(category).text()),
        };
    });

    return {
        title: 'TechCrunch',
        link: host,
        description: 'Reporting on the business of technology, startups, venture capital funding, and Silicon Valley.',
        item: items,
    };
}
