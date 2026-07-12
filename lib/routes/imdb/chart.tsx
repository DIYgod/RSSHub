import type { Context } from 'hono';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';

import type { ChartTitleSearchConnection } from './types';

// IMDb no longer ships chart data in the page HTML (it is behind an AWS WAF JS
// challenge). The same data is served by IMDb's public GraphQL API, which we
// query directly.
const GRAPHQL_ENDPOINT = 'https://api.graphql.imdb.com/';

// Route chart id -> ChartTitleType GraphQL enum.
const CHART_TYPES = {
    top: 'TOP_RATED_MOVIES',
    moviemeter: 'MOST_POPULAR_MOVIES',
    toptv: 'TOP_RATED_TV_SHOWS',
    tvmeter: 'MOST_POPULAR_TV_SHOWS',
};

const CHART_NAMES = {
    top: 'Top 250 Movies',
    moviemeter: 'Most Popular Movies',
    toptv: 'Top 250 TV Shows',
    tvmeter: 'Most Popular TV Shows',
};

const CHART_QUERY = `
    query Chart($chartType: ChartTitleType!, $first: Int!) {
        chartTitles(chart: { chartType: $chartType }, first: $first) {
            edges {
                currentRank
                node {
                    id
                    titleText { text }
                    originalTitleText { text }
                    titleType { text }
                    releaseYear { year endYear }
                    primaryImage { url caption { plainText } }
                    ratingsSummary { aggregateRating voteCount }
                    certificate { rating }
                    plot { plotText { plainText } }
                    titleGenres { genres { genre { text } } }
                }
            }
        }
    }
`;

const render = ({ primaryImage, originalTitleText, certificate, ratingsSummary, plot }) =>
    renderToString(
        <>
            {primaryImage?.url ? (
                <>
                    <figure>
                        <img src={primaryImage.url} alt={primaryImage.caption?.plainText} />
                        <figcaption>{primaryImage.caption?.plainText}</figcaption>
                    </figure>
                    <br />
                </>
            ) : null}
            {`Original title: ${originalTitleText.text}`}
            <br />
            {certificate ? `${certificate.rating} ` : null}
            {ratingsSummary?.aggregateRating ? `IMDb RATING: ${ratingsSummary.aggregateRating}/10 (${ratingsSummary.voteCount})` : null}
            <br />
            <br />
            {plot?.plotText?.plainText}
        </>
    );

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
    maintainers: ['TonyRL', 'JaggerH'],
    handler,
    url: 'www.imdb.com/chart/top/',
    description: `| Top 250 Movies | Most Popular Movies | Top 250 TV Shows | Most Popular TV Shows |
| -------------- | ------------------- | ---------------- | --------------------- |
| top            | moviemeter          | toptv            | tvmeter               |`,
};

async function handler(ctx: Context) {
    const { chart = 'top' } = ctx.req.param();
    const chartType = CHART_TYPES[chart] ?? CHART_TYPES.top;
    const link = `https://www.imdb.com/chart/${chart}/`;

    const { data } = await ofetch<{ data: { chartTitles: ChartTitleSearchConnection } }>(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-imdb-user-country': 'US',
            'x-imdb-user-language': 'en-US',
        },
        body: {
            query: CHART_QUERY,
            variables: { chartType, first: 250 },
        },
    });

    const items = data.chartTitles.edges.map(({ currentRank, node }) => ({
        title: `${currentRank}. ${node.titleText.text}${node.releaseYear ? ` (${node.releaseYear.year}${node.releaseYear.endYear ? `-${node.releaseYear.endYear}` : ''})` : ''}`,
        description: render({
            primaryImage: node.primaryImage,
            originalTitleText: node.originalTitleText,
            certificate: node.certificate,
            ratingsSummary: node.ratingsSummary,
            plot: node.plot,
        }),
        link: `https://www.imdb.com/title/${node.id}`,
        category: node.titleGenres?.genres.map((g) => g.genre.text) ?? [],
    }));

    return {
        title: `IMDb: ${CHART_NAMES[chart] ?? CHART_NAMES.top}`,
        link,
        item: items,
    };
}
