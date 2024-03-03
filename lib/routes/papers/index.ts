// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const { category = 'arxiv/cs.CL' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 150;

    const rootUrl = 'https://papers.cool';
    const currentUrl = new URL(category, rootUrl).href;

    const site = category.split(/\//)[0];
    const apiKimiUrl = new URL(`${site}/kimi/`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const pubDate = parseDate(
        $('p.info')
            .first()
            .text()
            .match(/(\d+\s\w+\s\d{4})/)[1],
        ['DD MMM YYYY', 'D MMM YYYY']
    );

    const items = $('div.panel')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const id = item.prop('id');
            const kimiUrl = new URL(id, apiKimiUrl).href;
            const enclosureUrl =
                item
                    .find('a.pdf-preview')
                    .prop('onclick')
                    .match(/'(http.*?)'/)?.[1] ?? undefined;

            return {
                title: item.find('span[id]').first().text(),
                link: kimiUrl,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    kimiUrl,
                    siteUrl: item.find('a').first().prop('href'),
                    pdfUrl: enclosureUrl,
                    summary: item.find('p.summary').text(),
                }),
                author: item
                    .find('p.authors a')
                    .toArray()
                    .map((a) => $(a).text())
                    .join('; '),
                guid: `${currentUrl}#${id}`,
                pubDate,
                enclosure_url: enclosureUrl,
                enclosure_type: enclosureUrl ? 'application/pdf' : undefined,
            };
        });

    const title = $('title').text();
    const icon = new URL('favicon.ico', rootUrl).href;

    ctx.set('data', {
        item: items,
        title: title.split(/-/)[0].trim(),
        link: currentUrl,
        description: title,
        icon,
        logo: icon,
        subtitle: $('h1').first().text(),
    });
};
