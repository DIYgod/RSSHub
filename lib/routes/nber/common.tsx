import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import { config } from '@/config';
import cache from '@/utils/cache';
import { getSubPath } from '@/utils/common-utils';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

interface WorkingPaper {
    title: string;
    url: string;
    newthisweek: boolean;
}

async function getData(url: string): Promise<WorkingPaper[]> {
    const response = await ofetch<{ results: WorkingPaper[] }>(url);
    return response.results;
}
export async function handler(ctx) {
    const url = 'https://www.nber.org/api/v1/working_page_listing/contentType/working_paper/_/_/search';
    const baseUrl = 'https://www.nber.org';
    const data = await cache.tryGet(url, () => getData(url), config.cache.routeExpire, false);
    const items = await pMap(
        data.filter((article) => getSubPath(ctx) === '/papers' || article.newthisweek),
        async (article) => {
            const link = `${baseUrl}${article.url}`;
            const detail = await cache.tryGet(`nber:article:v2:${link}`, async () => {
                const response = await ofetch(link);
                const $ = load(response);
                const downloadLink = $('meta[name="citation_pdf_url"]').attr('content');
                const fullAbstract = $('.page-header__intro-inner').html();
                const publishedAt = $('meta[name="citation_publication_date"]').attr('content');
                return {
                    author: $('meta[name="dcterms.creator"]').attr('content'),
                    pubDate: publishedAt ? timezone(parseDate(publishedAt, 'YYYY/MM/DD'), 0) : undefined,
                    doi: $('meta[name="citation_doi"]').attr('content'),
                    description: renderToString(
                        <>
                            {fullAbstract ? raw(fullAbstract) : null}
                            {downloadLink ? <a href={downloadLink}>Download PDF</a> : null}
                        </>
                    ),
                };
            });
            return { title: article.title, link, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: 'NBER Working Paper',
        link: 'https://www.nber.org/papers',
        item: items,
        description: 'National Bureau of Economic Research Working Papers articles',
    };
}
