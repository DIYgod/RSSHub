import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import { CookieJar } from 'tough-cookie';

import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

const cookieJar = new CookieJar();

// Values in a Nuxt payload; `undefined` comes from the -1 reference.
type PayloadValue = string | number | boolean | null | undefined | PayloadValue[] | { [key: string]: PayloadValue };

const isRecord = (value: PayloadValue): value is { [key: string]: PayloadValue } => !!value && typeof value === 'object' && !Array.isArray(value);

const decodePayload = (payload: PayloadValue[], index: number): PayloadValue => {
    if (index === -1) {
        return undefined;
    }
    const value = payload[index];
    if (Array.isArray(value)) {
        if (typeof value[0] === 'string' && ['Reactive', 'ShallowReactive', 'Ref', 'ShallowRef'].includes(value[0]) && typeof value[1] === 'number') {
            return decodePayload(payload, value[1]);
        }
        return value.map((reference) => (typeof reference === 'number' ? decodePayload(payload, reference) : undefined));
    }
    if (isRecord(value)) {
        const result: { [key: string]: PayloadValue } = {};
        for (const [key, reference] of Object.entries(value)) {
            if (typeof reference !== 'number') {
                throw new TypeError('The journal page contains an unsupported article reference');
            }
            result[key] = decodePayload(payload, reference);
        }
        return result;
    }
    return value;
};

const parseIssueArticles = (payload: PayloadValue[], issueUrl: string): DataItem[] => {
    const issuePath = new URL(issueUrl).pathname;
    const keyPrefix = `issue-articles-${issuePath.split('/').filter(Boolean).join('-')}-`;
    const state = payload.find((entry) => isRecord(entry) && Object.keys(entry).some((key) => key.startsWith(keyPrefix) && key.endsWith('-1')));
    if (!isRecord(state)) {
        throw new Error('The current journal issue does not contain its first-page article data');
    }
    const key = Object.keys(state).find((key) => key.startsWith(keyPrefix) && key.endsWith('-1'))!;
    const reference = state[key];
    const data = typeof reference === 'number' ? decodePayload(payload, reference) : undefined;
    if (!isRecord(data) || !Array.isArray(data.articles)) {
        throw new Error('The current journal issue contains invalid article data');
    }
    return data.articles.map((article) => {
        if (!isRecord(article) || typeof article.title !== 'string' || typeof article.identifier !== 'string' || typeof article.fullAbstract !== 'string' || !Array.isArray(article.authors)) {
            throw new Error('A journal article is missing its title, identifier, abstract, or authors');
        }
        return {
            title: article.title,
            link: new URL(`${issuePath}/${article.identifier}`, issueUrl).href,
            author: article.authors
                .filter(isRecord)
                .map((author) => author.name)
                .filter((name): name is string => typeof name === 'string')
                .join(', '),
            pubDate: typeof article.pubdate === 'string' && article.pubdate ? parseDate(article.pubdate) : undefined,
            description: renderDesc({ abstract: article.fullAbstract, img: typeof article.thumbnail === 'string' ? new URL(article.thumbnail, issueUrl).href : undefined }),
        };
    });
};

const renderDesc = (item: { img?: string; abstract: string }) =>
    renderToString(
        <>
            {item.img && <img src={item.img} />}
            <p>
                <span>{raw(item.abstract)}</span>
                <br />
            </p>
        </>
    );

export const route: Route = {
    path: '/:journal',
    categories: ['journal'],
    example: '/mdpi/analytica',
    parameters: { journal: 'Journal Name, get it from the journal homepage' },
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
            source: ['www.mdpi.com/journal/:journal'],
        },
    ],
    name: 'Journal',
    maintainers: ['Derekmini'],
    handler,
};

async function handler(ctx) {
    const journal = ctx.req.param('journal');
    const host = 'https://www.mdpi.com';
    const jrnlUrl = `${host}/journal/${journal}`;

    const response = await got(jrnlUrl, {
        cookieJar,
    });
    const $ = load(response.data);
    const jrnlName = $('h1').text();
    const currentIssuePath = $('a')
        .filter((_, element) => $(element).text() === 'Current Issue')
        .attr('href');
    if (!currentIssuePath) {
        throw new Error('The journal page does not contain a current issue link');
    }
    const issueUrl = new URL(currentIssuePath, host).href;

    const response2 = await got(issueUrl, {
        cookieJar,
    });
    const $2 = load(response2.data);
    const items = parseIssueArticles(JSON.parse($2('#__NUXT_DATA__').text()), issueUrl);

    return {
        title: jrnlName,
        link: jrnlUrl,
        item: items,
    };
}
