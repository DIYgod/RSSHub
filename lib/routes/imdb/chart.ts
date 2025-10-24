import { Route, ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import * as cheerio from 'cheerio';
import type { Context } from 'hono';
import { ChartTitleSearchConnection } from './types';
import path from 'node:path';
import { art } from '@/utils/render';

const render = (data) => art(path.join(__dirname, 'templates/chart.art'), data);

export const route: Route = {
    path: '/chart/:chart?',
    categories: ['multimedia'],
    view: ViewType.Notifications,
    parameters: {
        chart: {
            description: 'The chart to display, `top` by default',
            options: [
                { value: 'top', label: 'Top 250 Movies' },
                { value: 'moviemeter', label: 'Most Popular Movies' },
                { value: 'toptv', label: 'Top 250 TV Shows' },
                { value: 'tvmeter', label: 'Most Popular TV Shows' },
            ],
            default: 'top',
        },
    },
    example: '/imdb/chart',
    radar: [
        {
            source: ['www.imdb.com/chart/:chart/'],
        },
    ],
    name: 'Charts',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.imdb.com/chart/top/',
    description: `| Top 250 Movies | Most Popular Movies | Top 250 TV Shows | Most Popular TV Shows |
| -------------- | ------------------- | ---------------- | --------------------- |
| top            | moviemeter          | toptv            | tvmeter               |`,
};

async function handler(ctx: Context) {
    const { chart = 'top' } = ctx.req.param();
    const baseUrl = 'https://www.imdb.com';
    const link = `${baseUrl}/chart/${chart}/`;

    const response = await ofetch(link);
    const $ = cheerio.load(response);
    const nextData = JSON.parse($('script#__NEXT_DATA__').text());
    const chartTitles = nextData.props.pageProps.pageData.chartTitles as ChartTitleSearchConnection;

    const items = chartTitles.edges.map(({ currentRank, node }) => ({
        title: `${currentRank}. ${node.titleText.text} (${node.releaseYear.year}${node.releaseYear.endYear ? `-${node.releaseYear.endYear}` : ''})`,
        description: render({
            primaryImage: node.primaryImage,
            originalTitleText: node.originalTitleText,
            certificate: node.certificate,
            ratingsSummary: node.ratingsSummary,
            plot: node.plot,
        }),
        link: `${baseUrl}/title/${node.id}`,
        category: node.titleGenres.genres.map((g) => chartTitles.genres.find((genre) => genre.filterId === g.genre.text)?.text),
    }));

    return {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        link,
        item: items,
    };
}
