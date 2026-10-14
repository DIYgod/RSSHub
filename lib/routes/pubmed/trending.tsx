import { type CheerioAPI, load } from 'cheerio';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import utc from 'dayjs/plugin/utc.js';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

dayjs.extend(customParseFormat);
dayjs.extend(utc);

export const route: Route = {
    path: '/trending/:filters?',
    categories: ['journal'],
    example: '/pubmed/trending',
    parameters: { filters: 'Filters, can be found in URL' },
    name: 'Trending articles',
    maintainers: ['y9c', 'nczitzk'],
    handler,
    description: `::: tip
For the parameter **filter**, the \`filter\` parameter in the URL should be split into a string by \`,\`, here is an example.

In \`https://pubmed.ncbi.nlm.nih.gov/trending/?filter=simsearch1.fha&filter=pubt.clinicaltrial&filter=pubt.randomizedcontrolledtrial\`, the filter parameters are \`simsearch1.fha\`, \`pubt.clinicaltrial\`, and \`pubt.randomizedcontrolledtrial\`. Therefore, the filter corresponding to the route should be filled with \`simsearch1.fha,pubt.clinicaltrial,pubt.randomizedcontrolledtrial\`, and the route is [\`/pubmed/trending/simsearch1.fha,pubt.clinicaltrial,pubt.randomizedcontrolledtrial\`](https://rsshub.app/pubmed/trending/simsearch1.fha,pubt.clinicaltrial,pubt.randomizedcontrolledtrial)
:::`,
};

async function handler(ctx) {
    const filters = ctx.req.param('filters');

    const rootUrl = 'https://pubmed.ncbi.nlm.nih.gov';
    const currentUrl = `${rootUrl}/trending${filters ? `?filter=${filters.replaceAll(',', '&filter=')}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('a[data-article-id]')
        .toArray()
        .flatMap((element) => {
            const anchor = $(element);
            const id = anchor.attr('data-article-id');
            return id ? { title: anchor.text(), link: `${rootUrl}/${id}`, id } : [];
        });

    let articles: Promise<CheerioAPI> | undefined;
    const getArticles = () => (articles ??= fetchArticleXml(list.map((item) => item.id).join(',')));

    const items = await Promise.all(
        list.map(async ({ id, ...item }): Promise<DataItem> => {
            const details = await cache.tryGet(`${item.link}:pubmed-xml:v2`, async () => {
                const content = await getArticles();
                const article = content('PubmedArticle').filter((_, element) => content(element).find('MedlineCitation > PMID').text() === id);
                if (!article.length) {
                    throw new Error(`PubMed returned no article for PMID ${id}`);
                }
                const electronicDate = article.find('ArticleDate[DateType="Electronic"]').first();
                const publicationDate = electronicDate.length ? electronicDate : article.find('JournalIssue > PubDate').first();
                const date =
                    publicationDate.find('MedlineDate').text() ||
                    publicationDate
                        .find('Year, Month, Day')
                        .toArray()
                        .map((element) => content(element).text())
                        .join(' ');
                const pubDate = date ? parsePublicationDate(date) : undefined;
                return {
                    title: article.find('ArticleTitle').text(),
                    doi: article.find('ArticleId[IdType="doi"]').first().text() || undefined,
                    pubDate: pubDate && !Number.isNaN(pubDate.getTime()) ? pubDate : undefined,
                    author: article
                        .find('AuthorList > Author')
                        .toArray()
                        .map((element) => {
                            const author = content(element);
                            return {
                                name: author.find('CollectiveName').text() || [author.find('ForeName').text() || author.find('Initials').text(), author.find('LastName').text()].filter(Boolean).join(' '),
                            };
                        })
                        .filter((author) => author.name),
                    description: renderToString(
                        <>
                            {article
                                .find('Abstract > AbstractText')
                                .toArray()
                                .map((element) => {
                                    const abstract = content(element);
                                    return (
                                        <>
                                            {abstract.attr('Label') ? <h3>{abstract.attr('Label')}</h3> : null}
                                            <p>{raw(abstract.html() ?? '')}</p>
                                        </>
                                    );
                                })}
                        </>
                    ),
                };
            });
            return { ...item, ...details };
        })
    );

    return {
        title: 'Trending page - PubMed',
        link: currentUrl,
        item: items,
    };
}

function parsePublicationDate(value: string): Date | undefined {
    for (const format of ['YYYY M D', 'YYYY MMM D', 'YYYY MMMM D', 'YYYY M', 'YYYY MMM', 'YYYY MMMM', 'YYYY']) {
        const date = dayjs.utc(value, format);
        if (date.isValid()) {
            return date.toDate();
        }
    }
}

async function fetchArticleXml(ids: string) {
    const response = await got('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi', {
        searchParams: { db: 'pubmed', id: ids, retmode: 'xml' },
    });
    return load(response.data, { xmlMode: true });
}
