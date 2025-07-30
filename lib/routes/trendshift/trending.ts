import { Data, Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/trending',
    categories: ['programming'],
    example: '/trendshift/trending?range=7&language=javascript&limit=50',
    parameters: {
        range: 'Trending range: 1, 7, 30, 360, default all days',
        language: 'Programming language: javascript, typescript, python, etc., or default all languages',
        limit: 'Number of repositories: 25, 50, 100, default 25',
    },
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
            source: ['trendshift.io/'],
        },
    ],
    name: 'Trending Repositories',
    maintainers: ['assistant'],
    handler,
    url: 'trendshift.io/',
};

async function handler(ctx) {
    const range = ctx.req.query('range') || undefined;
    const language = ctx.req.query('language') || undefined;
    const limit = ctx.req.query('limit') || undefined;

    const params = new URLSearchParams();
    if (range) {
        params.set('trending-range', range);
    }
    if (language) {
        params.set('trending-language', language);
    }
    if (limit) {
        params.set('trending-limit', limit);
    }

    const url = `https://trendshift.io/?${params.toString()}`;
    const { data } = await got(url);
    const $ = load(data);

    const items = $('.bg-white.rounded-lg.border.border-gray-300.px-4.py-3.shadow-sm')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const titleLink = $item.find('a.text-indigo-400.font-medium').first();
            const title = titleLink.text().trim();
            const repoLink = titleLink.attr('href');
            const description = $item.find('.text-gray-500.text-xs').last().text().trim();

            // Extract stars and forks from the stats section
            const statsItems = $item.find('.flex.items-center.space-x-3.text-xs.text-gray-500 .flex.items-center');
            const starsText = statsItems.first().text().trim();
            const forksText = statsItems.eq(1).text().trim();

            // Extract language from the language indicator
            const languageDiv = $item.find('.text-gray-500.flex.items-center.text-xs').first();
            const languageSpan = languageDiv.contents().text().trim();

            const githubLink = $item.find('a[href*="github.com"]').attr('href');

            return {
                title: title || 'Repository',
                description: `${description}\n\nStars: ${starsText}\nForks: ${forksText}\nLanguage: ${languageSpan}`,
                link: githubLink || `https://trendshift.io${repoLink}`,
                category: [languageSpan].filter(Boolean),
            };
        })
        .filter((item) => item.title !== 'Repository');

    const rangeText = range ? `${range} days` : 'All Time';
    const languageText = language ?? 'All Languages';

    return {
        title: `TrendShift - Trending Repositories (${rangeText}, ${languageText})`,
        link: url,
        item: items,
        description: `Trending GitHub repositories on TrendShift for ${rangeText} in ${languageText}`,
        logo: 'https://trendshift.io/favicon.ico',
        icon: 'https://trendshift.io/favicon.ico',
        language: 'en-us',
    } as Data;
}
