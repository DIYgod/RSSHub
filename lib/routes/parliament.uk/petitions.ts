import path from 'node:path';

import { type Context } from 'hono';
import { load, type CheerioAPI } from 'cheerio';

import { type DataItem, type Route, type Data, ViewType } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import ofetch from '@/utils/ofetch';

export const handler = async (ctx: Context): Promise<Data> => {
    const { state = 'all' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '50', 10);

    const rootUrl: string = 'https://petition.parliament.uk';
    const targetUrl: string = new URL(`petitions?state=${state}`, rootUrl).href;
    const jsonUrl: string = new URL('petitions.json', rootUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language: string = $('html').prop('lang') ?? 'en';

    const jsonResponse = await ofetch(jsonUrl, {
        query: {
            page: 1,
            state,
        },
    });

    const items = jsonResponse.data.slice(0, limit).map((item): DataItem => {
        const attributes = item.attributes;

        const title = attributes.action;
        const description = art(path.join(__dirname, 'templates/description.art'), {
            intro: attributes.background,
            description: attributes.additional_details,
        });
        const guid = `parliament.uk-petition-${item.id}`;

        const author: DataItem['author'] = attributes.creator_name;

        const extraLinks = attributes.departments?.map((link) => ({
            url: link.url,
            type: 'related',
            content_html: link.name,
        }));

        return {
            title,
            description,
            pubDate: parseDate(attributes.created_at),
            link: new URL(`petitions/${item.id}`, rootUrl).href,
            category: [...new Set([...(attributes.topics ?? []), ...(attributes.departments?.map((d) => d.name) ?? [])])].filter(Boolean),
            author,
            guid,
            id: guid,
            content: {
                html: description,
                text: attributes.background,
            },
            updated: parseDate(attributes.updated_at),
            language,
            _extra: {
                links: extraLinks?.length ? extraLinks : undefined,
            },
        };
    });

    const feedImage = $('meta[property="og:image"]').prop('content');

    return {
        title: $('h1.page-title').text(),
        description: $('meta[property="twitter:description"]').prop('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: feedImage,
        author: $('meta[name="msapplication-tooltip"]').prop('content'),
        language,
        id: $('meta[property="og:url"]').prop('content'),
    };
};

export const route: Route = {
    path: '/petitions/:state?',
    name: 'Petitions',
    url: 'petition.parliament.uk',
    maintainers: ['nczitzk'],
    handler,
    example: '/parliament.uk/petitions/all',
    parameters: {
        state: 'State, `all` by default, see below',
    },
    description: `::: tip
If you subscribe to [Recent petitions](https://petition.parliament.uk/petitions?state=recent)，where the URL is \`https://petition.parliament.uk/petitions?state=recent\`, use the value of \`state\` as the parameter to fill in. Therefore, the route will be [\`/parliament.uk/petitions/recent\`](https://rsshub.app/parliament.uk/petitions/recent).
:::

<details>
<summary>More states</summary>

| Name                            | ID                |
| ------------------------------- | ----------------- |
| All petitions                   | all               |
| Open petitions                  | open              |
| Recent petitions                | recent            |
| Closed petitions                | closed            |
| Rejected petitions              | rejected          |
| Awaiting government response    | awaiting_response |
| Government responses            | with_response     |
| Awaiting a debate in Parliament | awaiting_debate   |
| Debated in Parliament           | debated           |
| Not debated in Parliament       | not_debated       |

</details>
    `,
    categories: ['government'],
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
            source: ['petition.parliament.uk/petitions'],
            target: (_, url) => {
                const urlObj = new URL(url);
                const state = urlObj.searchParams.get('state');

                return `/parliament.uk/petitions${state ? `/${state}` : ''}`;
            },
        },
        {
            title: 'All petitions',
            source: ['petition.parliament.uk/petitions'],
            target: '/petitions/all',
        },
        {
            title: 'Open petitions',
            source: ['petition.parliament.uk/petitions'],
            target: '/petitions/open',
        },
        {
            title: 'Recent petitions',
            source: ['petition.parliament.uk/petitions'],
            target: '/petitions/recent',
        },
        {
            title: 'Closed petitions',
            source: ['petition.parliament.uk/petitions'],
            target: '/petitions/closed',
        },
        {
            title: 'Rejected petitions',
            source: ['petition.parliament.uk/petitions'],
            target: '/petitions/rejected',
        },
        {
            title: 'Awaiting government response',
            source: ['petition.parliament.uk/petitions'],
            target: '/petitions/awaiting_response',
        },
        {
            title: 'Government responses',
            source: ['petition.parliament.uk/petitions'],
            target: '/petitions/with_response',
        },
        {
            title: 'Awaiting a debate in Parliament',
            source: ['petition.parliament.uk/petitions'],
            target: '/petitions/awaiting_debate',
        },
        {
            title: 'Debated in Parliament',
            source: ['petition.parliament.uk/petitions'],
            target: '/petitions/debated',
        },
        {
            title: 'Not debated in Parliament',
            source: ['petition.parliament.uk/petitions'],
            target: '/petitions/not_debated',
        },
    ],
    view: ViewType.Articles,
};
