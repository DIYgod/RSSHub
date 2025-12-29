import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/daily-papers/:cycle?/:voteFliter?',
    categories: ['programming'],
    example: '/huggingface/daily-papers/week/50',
    parameters: { cycle: 'The publication cycle you want to follow. Choose from: date, week, month. Default: date', voteFliter: 'Filter papers by vote count.' },
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
            source: ['huggingface.co/papers/:cycle'],
            target: '/daily-papers/:cycle',
        },
    ],
    name: 'Daily Papers',
    maintainers: ['zeyugao', 'ovo-tim'],
    handler,
    url: 'huggingface.co/papers',
};

interface Paper {
    id: string;
    summary: string;
    upvotes: number;
    authors: { name: string }[];
}

interface DailyPaperItem {
    title: string;
    paper: Paper;
    publishedAt: string;
}

interface PapersData {
    dailyPapers: DailyPaperItem[];
}

async function handler(ctx) {
    const { cycle = 'date', voteFliter = '0' } = ctx.req.param();
    let url: string;
    switch (cycle) {
        case 'date':
            url = 'https://huggingface.co/papers';
            break;
        case 'week':
            // We don't actually need to get the week number, because huggingface.co/papers/week/YYYY-W52 will redirect to the latest week
            url = `https://huggingface.co/papers/week/${new Date().getFullYear()}-W52`;
            break;
        case 'month':
            url = `https://huggingface.co/papers/month/${new Date().toISOString().slice(0, 7)}`;
            break;
        default:
            throw new Error(`Invalid cycle: ${cycle}`);
    }

    const { body: response } = await got(url);
    const $ = load(response);
    const papers = $('div[data-target="DailyPapers"]').data('props') as PapersData;

    const items = papers.dailyPapers
        .filter((item) => item.paper.upvotes >= voteFliter)
        .map((item) => ({
            title: item.title,
            link: `https://arxiv.org/abs/${item.paper.id}`,
            description: item.paper.summary.replaceAll('\n', ' '),
            pubDate: parseDate(item.publishedAt),
            author: item.paper.authors.map((author) => author.name).join(', '),
            upvotes: item.paper.upvotes,
        }))
        .toSorted((a, b) => b.upvotes - a.upvotes);

    return {
        allowEmpty: true,
        title: 'Huggingface Daily Papers',
        link: 'https://huggingface.co/papers',
        item: items,
    };
}
