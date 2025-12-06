import type { Data, Route } from '@/types';
import got from '@/utils/got';
import { parseRelativeDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/trending/:language?',
    categories: ['programming'],
    example: '/trendshift/trending',
    parameters: {
        language: 'Programming language: javascript, typescript, python, etc., or default all languages',
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
    maintainers: ['Rjnishant530'],
    handler,
    url: 'trendshift.io/',
};

async function handler(ctx) {
    const language = ctx.req.param('language') || 'all';
    const date = parseRelativeDate('1 day ago');
    const isoDate = new Date(date).toISOString().split('T')[0];
    const nextAction = '7fcfa70a759dfb860300f6e58d2ba5a6e7d788cb13';
    const url = 'https://trendshift.io';
    const { data } = await got.post(url, {
        json: [isoDate, language],
        headers: { 'Content-Type': 'application/json', 'next-action': nextAction },
    });

    const jsonData = convertToJson(data);
    const items = jsonData.map((item) => {
        const { full_name, repository_stars, repository_forks, repository_language, repository_description } = item;
        return {
            title: full_name || 'Repository',
            description: `${repository_description}\n\nStars: ${repository_stars}\nForks: ${repository_forks}\nLanguage: ${repository_language}`,
            link: `https://github.com/${full_name}`,
            category: [repository_language].filter(Boolean),
        };
    });

    const languageText = language ?? 'All Languages';

    return {
        title: `TrendShift - Daily repositories to explore ( ${languageText})`,
        link: url,
        item: items,
        description: `An alternative to GitHub Trending, using a consistent scoring algorithm informed by daily engagement metrics`,
        logo: 'https://trendshift.io/favicon.ico',
        icon: 'https://trendshift.io/favicon.ico',
        language: 'en-us',
    } as Data;
}

function convertToJson(data: string): Array<any> {
    const line = data.split('\n')[1];

    const idx = line.indexOf(':');
    const jsonpart = line.slice(idx + 1).trim();
    return JSON.parse(jsonpart);
}
