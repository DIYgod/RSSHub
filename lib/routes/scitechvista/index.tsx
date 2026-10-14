import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { Data, DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { namespace } from './namespace';

const baseUrl = `https://${namespace.url}`;

function parseRocDate(rocDate: string | undefined): Date | undefined {
    if (!rocDate) {
        return undefined;
    }
    // Expect formats like 114/08/31
    const parts = rocDate.trim().split('/');
    if (parts.length !== 3) {
        return undefined;
    }
    const [rocYearStr, monthStr, dayStr] = parts;
    const rocYear = Number(rocYearStr);

    const year = rocYear + 1911;
    return parseDate(`${year}-${monthStr}-${dayStr}`, 'YYYY-MM-DD');
}

export const route: Route = {
    path: '/',
    categories: ['government'],
    example: '/scitechvista',
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
            source: ['scitechvista.nat.gov.tw/'],
        },
    ],
    name: '最新文章',
    maintainers: ['johan456789'],
    handler,
    url: namespace.url,
};

async function handler(): Promise<Data> {
    const currentUrl = `${baseUrl}/Article/C000003/new`;
    const html = await ofetch(currentUrl);
    const $ = load(html);

    const language = ($('html').attr('lang') ?? 'zh-TW') as Language;
    const articleNodes = $('div.kf-diagramtext-list > div.kf-diagramtext-col').toArray();

    const items: DataItem[] = articleNodes
        .map((colEl): DataItem => {
            const node = $(colEl);
            const anchor = node.find('a[href*="/Article/C000003/detail"]');

            const linkPath = anchor.attr('href');
            const link = linkPath ? new URL(linkPath, baseUrl).href : undefined;

            const title = node.find('div.kf-title').text();

            const dateText = node.find('div.kf-date > span').text().trim();
            const parsedDate = parseRocDate(dateText);
            const pubDate = parsedDate ? timezone(parsedDate, 8) : undefined;

            const imagePath = node.find('img').attr('src');
            const image = imagePath ? new URL(imagePath, baseUrl).href : undefined;

            const snippet = node.find('div.kf-txt').text().trim();

            const description = renderToString(
                <>
                    {image ? (
                        <p>
                            <img src={image} alt="" />
                        </p>
                    ) : null}
                    {snippet ? <p>{raw(snippet)}</p> : null}
                </>
            );

            return {
                title,
                description,
                link,
                pubDate,
                image,
            };
        })
        .filter(Boolean);

    const detailedItems = await pMap(
        items,
        async (item) =>
            item.link
                ? {
                      ...item,
                      ...(await cache.tryGet<Pick<DataItem, 'description' | 'author' | 'category'>>(`scitechvista:article:v3:${item.link}`, async () => {
                          const pageSource1 = await ofetch(item.link!);
                          const article = load(pageSource1);
                          const category = article('.DetailContent a.badge-LightGray')
                              .toArray()
                              .map((element) =>
                                  article(element)
                                      .text()
                                      .replace(/\(\d+\)$/, '')
                                      .trim()
                              )
                              .filter(Boolean);
                          article('.DetailContent .Stv-Sticker').remove();
                          const description = article('.DetailContent')
                              .toArray()
                              .filter((element) => !article(element).find('h2.kf-det-title').length)
                              .map((element) => article(element).html())
                              .join('');
                          const author = article('.Article-AuthorRow')
                              .first()
                              .find('.Author')
                              .toArray()
                              .map((element) => article(element).text().trim())
                              .filter(Boolean)
                              .join(', ');
                          return { description, ...(author && { author }), ...(category.length && { category }) };
                      })),
                  }
                : item,
        { concurrency: 3 }
    );

    return {
        title: `${namespace.name} - 最新文章`,
        link: currentUrl,
        language,
        item: detailedItems,
    };
}
