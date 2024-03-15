import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/daily-papers',
    categories: ['programming'],
    example: '/huggingface/daily-papers',
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
            source: ['huggingface.co/papers', 'huggingface.co/'],
        },
    ],
    name: 'Daily Papers',
    maintainers: ['zeyugao'],
    handler,
    url: 'huggingface.co/papers',
};

async function handler() {
    const { body: response } = await got('https://huggingface.co/papers');
    const $ = load(response);
    const papers = $('main > div[data-target="DailyPapers"]').data('props');

    const items = papers.dailyPapers
        .map((item) => ({
            title: item.title,
            link: `https://arxiv.org/abs/${item.paper.id}`,
            description: item.paper.summary.replaceAll('\n', ' '),
            pubDate: parseDate(item.publishedAt),
            author: item.paper.authors.map((author) => author.name).join(', '),
            upvotes: item.paper.upvotes,
        }))
        .sort((a, b) => b.upvotes - a.upvotes);

    return {
        title: 'Huggingface Daily Papers',
        link: 'https://huggingface.co/papers',
        item: items,
    };
}
