import { type CheerioAPI, load } from 'cheerio';

import type { Data, DataItem } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import playwright from '@/utils/playwright';
import { getCookies } from '@/utils/playwright-utils';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.caict.ac.cn';

const fetchChallenged = async (link: string, waitSelector: string) => {
    const context = await playwright();
    try {
        const page = await context.newPage();
        await page.route('**/*', (route) => {
            const resourceType = route.request().resourceType();
            return resourceType === 'document' || resourceType === 'script' ? route.continue() : route.abort();
        });

        logger.http(`Requesting ${link}`);
        await page.goto(link, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector(waitSelector, { timeout: 10000 });

        const html = await page.content();
        const cookie = await getCookies(page, 'www.caict.ac.cn');

        return { html, cookie };
    } finally {
        await context.close();
    }
};

export const getFeed = async (path: string, itemSelector: string, getDescription?: ($: CheerioAPI) => string | null | undefined): Promise<Data> => {
    const link = `${baseUrl}/${path}/`;
    const { html, cookie } = await fetchChallenged(link, itemSelector);

    const $ = load(html);
    const list = $(itemSelector)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a');
            return {
                title: a.text().trim().replace(/^-\s*/, ''),
                link: new URL(a.attr('href')!, link).href,
                pubDate: timezone(parseDate($item.next().find('span.kxyj_text').text()), 8),
            };
        }) as DataItem[];

    const items = getDescription
        ? await Promise.all(
              list.map((item) => {
                  if (!item.link!.startsWith(`${baseUrl}/`)) {
                      return item;
                  }
                  return cache.tryGet(item.link!, async () => {
                      const response = await ofetch(item.link!, { headers: { cookie } });
                      item.description = getDescription(load(response)) ?? undefined;

                      return item;
                  });
              })
          )
        : list;

    return {
        title: $('title').text(),
        link,
        item: items as DataItem[],
    };
};
