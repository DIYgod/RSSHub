import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import { CookieJar } from 'tough-cookie';

import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const cookieJar = new CookieJar();

const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);

const decodePayload = (payload: unknown[], index: number, decoded = new Map<number, unknown>()): unknown => {
    if (index === -1) {
        return undefined;
    }
    if (decoded.has(index)) {
        return decoded.get(index);
    }
    const value = payload[index];
    if (Array.isArray(value)) {
        if (['Reactive', 'ShallowReactive', 'Ref', 'ShallowRef'].includes(value[0])) {
            return decodePayload(payload, value[1], decoded);
        }
        const result: unknown[] = [];
        decoded.set(index, result);
        result.push(...value.map((reference) => decodePayload(payload, reference, decoded)));
        return result;
    }
    if (isRecord(value)) {
        const result: Record<string, unknown> = {};
        decoded.set(index, result);
        for (const [key, reference] of Object.entries(value)) {
            if (typeof reference !== 'number') {
                throw new TypeError('The journal page contains an unsupported article reference');
            }
            result[key] = decodePayload(payload, reference, decoded);
        }
        return result;
    }
    return value;
};

const parseIssueArticles = (payload: unknown[], issueUrl: string): DataItem[] => {
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
    return data.articles.map((article: unknown) => {
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
    const jrnlName = $('.journal__description').find('h1').text() || $('h1').first().text();
    const currentIssuePath =
        $('.side-menu-ul').find('a').eq(1).attr('href') ??
        $('a')
            .filter((_, element) => $(element).text().trim() === 'Current Issue')
            .first()
            .attr('href');
    if (!currentIssuePath) {
        throw new Error('The journal page does not contain a current issue link');
    }
    const issueUrl = new URL(currentIssuePath, host).href;

    const response2 = await got(issueUrl, {
        cookieJar,
    });
    const $2 = load(response2.data);
    const issue = $2('.content__container').find('h1').text().trim();
    const list = $2('.article-item')
        .toArray()
        .map((item): DataItem & { authors: string; doi: string; abstract: string; issue: string; img?: string } => {
            const title = $2(item).find('.title-link').text();
            const link = `${host}${$2(item).find('.title-link').attr('href')}`;
            const authors = $2(item).find('.authors').find('.inlineblock').text();
            const publishedDate = $2(item)
                .find('.color-grey-dark')
                .text()
                .match(/ - (\d{1,2} [A-Z]{3} \d{4})/i)?.[1];
            const doiLink = $2(item).find('.color-grey-dark').find('a').attr('href');
            let doi = '';
            if (doiLink !== undefined) {
                doi = doiLink.replace('https://doi.org/', '');
            }
            $2(item).find('.abstract-full').find('a').remove();
            const abstract = $2(item).find('.abstract-full').html()?.trim() ?? '';
            const imageSource = $2(item).find('.openpopupgallery').find('img').attr('data-src');
            const img = imageSource ? new URL(imageSource, host).href : undefined;
            return {
                title,
                authors,
                author: authors,
                pubDate: publishedDate ? parseDate(publishedDate, 'D MMM YYYY') : undefined,
                link,
                doi,
                abstract,
                issue,
                img,
            };
        });

    const nuxtData = $2('#__NUXT_DATA__').text();
    const items =
        !list.length && nuxtData
            ? parseIssueArticles(JSON.parse(nuxtData), issueUrl)
            : list.map(({ title, link, author, pubDate, abstract, img }) => ({
                  title,
                  link,
                  author,
                  pubDate,
                  description: renderDesc({ abstract, img }),
              }));

    return {
        title: jrnlName,
        link: jrnlUrl,
        item: items,
    };
}
