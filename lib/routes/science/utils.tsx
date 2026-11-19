import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import type { Page } from '@/utils/playwright';
import { parseDate } from '@/utils/time';
import { isOnSite } from '@/utils/valid-host';

const baseUrl = 'https://www.science.org';

const fetchDesc = (list: Array<DataItem & { link: string }>, page: Page) =>
    pMap(
        list,
        async (item) => {
            // only follow links on the site itself
            if (!isOnSite(item.link, 'science.org')) {
                return item;
            }
            const description = await cache.tryGet<string>(`science:body:v2:${item.link}`, async () => {
                await page.route('**/*', (route) => {
                    const request = route.request();
                    request.resourceType() === 'document' || request.resourceType() === 'script' ? route.continue() : route.abort();
                });

                await page.goto(item.link, {
                    waitUntil: 'domcontentloaded',
                });
                await page.waitForSelector('section#bodymatter, .news-article-content, .news-article-content--featured');
                const res = await page.evaluate(() => document.documentElement.getHTML());

                const $ = load(res);
                const abstract = $('div#abstracts').html();
                const content = $('.news-article-content--featured').length
                    ? $('.news-article-content--featured').html()
                    : $('.news-article-content').length
                      ? $('.news-article-content').html()
                      : $('.info-panel__formats a.btn__request-access').length || $('.info-panel__formats a.btn--access').length
                        ? ''
                        : $('section#bodymatter').html();

                return renderDescription(abstract, content);
            });
            return { ...item, description };
        },
        { concurrency: 1 }
    );

const getItem = (item, $) => {
    const $item = $(item);
    return {
        title: $item.find('.article-title a').attr('title'),
        link: new URL($item.find('.article-title a').attr('href'), baseUrl).href,
        doi: $item.find('.article-title a').attr('href').replace('/doi/', ''),
        pubDate: parseDate($item.find('.card-meta__item time').text()),
        author: $item
            .find('.card-meta ul[title="list of authors"] li')
            .toArray()
            .map((author) => $(author).text())
            .join(', '),
    };
};

export { baseUrl, fetchDesc, getItem };

const renderDescription = (abs: string | null, content: string | null): string =>
    renderToString(
        <>
            {abs ? raw(abs) : null}
            {content ? (
                <>
                    <br />
                    {raw(content)}
                </>
            ) : null}
        </>
    );
