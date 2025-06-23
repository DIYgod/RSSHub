import { type Data, type DataItem, type Route, ViewType } from '@/types';

import { art } from '@/utils/render';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { type CheerioAPI, load } from 'cheerio';
import { type Context } from 'hono';
import path from 'node:path';

const orderbys = (desc: string) => {
    const base = {
        0: 'search.score() desc, Metadata/OfficialRepositoryNumber desc, NameSortable asc',
        1: 'NameSortable asc, Metadata/OfficialRepositoryNumber desc, Metadata/RepositoryStars desc, Metadata/Committed desc',
        2: 'Metadata/Committed desc, Metadata/OfficialRepositoryNumber desc, Metadata/RepositoryStars desc',
    };

    if (desc === '1') {
        return base;
    }

    const inverted = {};
    for (const key in base) {
        const orderStr = base[key];
        inverted[key] = orderStr.replaceAll(/\b(desc|asc)\b/gi, (match) => (match.toLowerCase() === 'desc' ? 'asc' : 'desc'));
    }
    return inverted;
};

const filters = {
    o: 'Metadata/OfficialRepositoryNumber eq 1', // offical buckets only
    dm: 'Metadata/DuplicateOf eq null', // distinct manifests only
};

export const handler = async (ctx: Context): Promise<Data> => {
    const { query = 's=2&d=1&n=true&dm=true&o=true' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '50', 10);

    const baseUrl: string = 'https://scoop.sh';
    const apiBaseUrl: string = 'https://scoopsearch.search.windows.net';
    const targetUrl: string = new URL(`/#/apps?${query}`, baseUrl).href;
    const apiUrl: string = new URL('indexes/apps/docs/search', apiBaseUrl).href;

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'en';

    const scriptRegExp: RegExp = /<script type="module" crossorigin src="(.*?)"><\/script>/;
    const scriptUrl: string = scriptRegExp.test(targetResponse) ? new URL(targetResponse.match(scriptRegExp)?.[1], baseUrl).href : '';

    if (!scriptUrl) {
        throw new Error('JavaScript file not found.');
    }

    const scriptResponse = await ofetch(scriptUrl, {
        parseResponse: (txt) => txt,
    });

    const key: string = scriptResponse.match(/VITE_APP_AZURESEARCH_KEY:"(.*?)"/)?.[1];

    if (!key) {
        throw new Error('Key not found.');
    }

    const isOffcial: boolean = !query.includes('o=false');
    const isDistinct: boolean = !query.includes('dm=false');
    const sort: string = query.match(/s=(\d+)/)?.[1] ?? '2';
    const desc: string = query.match(/d=(\d+)/)?.[1] ?? '1';

    const response = await ofetch(apiUrl, {
        method: 'post',
        query: {
            'api-version': '2020-06-30',
        },
        headers: {
            'api-key': key,
            origin: baseUrl,
            referer: baseUrl,
        },
        body: {
            count: true,
            search: '',
            searchMode: 'all',
            filter: [isOffcial ? filters.o : undefined, isDistinct ? filters.dm : undefined].filter(Boolean).join(' and '),
            orderby: orderbys(desc)[sort],
            skip: 0,
            top: limit,
            select: 'Id,Name,NamePartial,NameSuffix,Description,Notes,Homepage,License,Version,Metadata/Repository,Metadata/FilePath,Metadata/OfficialRepository,Metadata/RepositoryStars,Metadata/Committed,Metadata/Sha',
            highlight: 'Name,NamePartial,NameSuffix,Description,Version,License,Metadata/Repository',
            highlightPreTag: '<mark>',
            highlightPostTag: '</mark>',
        },
    });

    let items: DataItem[] = [];

    items = response.value.slice(0, limit).map((item): DataItem => {
        const repositorySplits: string[] = item.Metadata.Repository.split(/\//);
        const repositoryName: string = repositorySplits.slice(-2).join('/');
        const title: string = `${item.Name} ${item.Version} in ${repositoryName}`;
        const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
            item,
        });
        const pubDate: number | string = item.Metadata.Committed;
        const linkUrl: string | undefined = item.Homepage;
        const authors: DataItem['author'] = [
            {
                name: repositoryName,
                url: item.Metadata.Repository,
                avatar: undefined,
            },
        ];
        const guid: string = `scoop-${item.Name}-${item.Version}-${item.Metadata.Sha}`;
        const updated: number | string = pubDate;

        const processedItem: DataItem = {
            title,
            description,
            pubDate: pubDate ? parseDate(pubDate) : undefined,
            link: linkUrl,
            author: authors,
            guid,
            id: guid,
            content: {
                html: description,
                text: description,
            },
            updated: updated ? parseDate(updated) : undefined,
            language,
        };

        return processedItem;
    });

    const author: string = 'Scoop';

    return {
        title: `${author} - Apps`,
        description: undefined,
        link: targetUrl,
        item: items,
        allowEmpty: true,
        author,
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/apps/:query?',
    name: 'Apps',
    url: 'scoop.sh',
    maintainers: ['nczitzk'],
    handler,
    example: '/scoop/apps',
    parameters: {
        query: {
            description: 'Query, `s=2&d=1&n=true&dm=true&o=true` by default',
        },
    },
    description: `:::tip
To subscribe to [Apps](https://scoop.sh/#/apps?s=2&d=1&n=true&dm=true&o=true), where the source URL is \`https://scoop.sh/#/apps?s=2&d=1&n=true&dm=true&o=true\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/scoop/apps/s=2&d=1&n=true&dm=true&o=true\`](https://rsshub.app/scoop/apps/s=2&d=1&n=true&dm=true&o=true).

:::
`,
    categories: ['program-update'],
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
            source: ['scoop.sh/#/apps', 'scoop.sh'],
            target: (_, url) => {
                const urlObj: URL = new URL(url);
                const query: string | undefined = urlObj.searchParams.toString() ?? undefined;

                return `/scoop/apps${query ? `/${query}` : ''}`;
            },
        },
    ],
    view: ViewType.Notifications,
};
