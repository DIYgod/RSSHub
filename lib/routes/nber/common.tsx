import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import { config } from '@/config';
import cache from '@/utils/cache';
import { getSubPath } from '@/utils/common-utils';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

async function getData(url) {
    const response = await ofetch(url);
    return response.results;
}
export async function handler(ctx) {
    const url = 'https://www.nber.org/api/v1/working_page_listing/contentType/working_paper/_/_/search';
    const baseUrl = 'https://www.nber.org';
    const data = await cache.tryGet(url, () => getData(url), config.cache.routeExpire, false);
    const items = await Promise.all(
        data
            .filter((article) => getSubPath(ctx) === '/papers' || article.newthisweek)
            .map((article) => {
                const link = `${baseUrl}${article.url}`;
                return cache.tryGet(link, async () => {
                    const response = await ofetch(link);
                    const $ = load(response);
                    const downloadLink = $('meta[name="citation_pdf_url"]').attr('content');
                    const fullAbstract = $('.page-header__intro-inner').html();
                    return {
                        title: article.title,
                        author: $('meta[name="dcterms.creator"]').attr('content'),
                        pubDate: parseDate($('meta[name="citation_publication_date"]').attr('content'), 'YYYY/MM/DD'),
                        link,
                        doi: $('meta[name="citation_doi"]').attr('content'),
                        description: renderToString(
                            <>
                                {fullAbstract ? raw(fullAbstract) : null}
                                {downloadLink ? <a href={downloadLink}>Download PDF</a> : null}
                            </>
                        ),
                    };
                });
            })
    );

    return {
        title: 'NBER Working Paper',
        link: 'https://www.nber.org/papers',
        item: items,
        description: `National Bureau of Economic Research Working Papers articles`,
    };
}
