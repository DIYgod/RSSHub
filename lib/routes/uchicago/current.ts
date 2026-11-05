import { load } from 'cheerio';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
import type { Page } from '@/utils/playwright';
import { getPlaywrightPage } from '@/utils/playwright';
import { getCookies, setCookies } from '@/utils/playwright-utils';

const configurePage = async (page: Page) => {
    await page.route('**/*', async (route) => {
        const request = route.request();
        await (request.resourceType() === 'document' ? route.continue() : route.abort());
    });
};

export const route: Route = {
    path: '/journals/current/:journal',
    categories: ['journal'],
    example: '/uchicago/journals/current/jpe',
    parameters: { journal: 'Journal id, can be found in URL. [Browse journals by title](https://www.journals.uchicago.edu/action/showPublications)' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['journals.uchicago.edu/toc/:journal/current', 'journals.uchicago.edu/journal/:journal'],
        },
    ],
    name: 'Current Issue',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const journal = ctx.req.param('journal');
    const baseUrl = 'https://www.journals.uchicago.edu';
    const link = `${baseUrl}/toc/${journal}/current`;

    logger.http(`Requesting ${link}`);
    const { context, page, destroy } = await getPlaywrightPage(link, {
        closeTimeout: 0,
        gotoConfig: { waitUntil: 'domcontentloaded' },
        onBeforeLoad: configurePage,
    });
    let tasks: Array<Promise<DataItem>> = [];
    try {
        const response = await page.evaluate(() => document.documentElement.getHTML());
        const cookies = await getCookies(page);
        await page.close();
        const $ = load(response);

        const list = $('.issue-item__title')
            .toArray()
            .map((item): DataItem & { link: string } => ({
                link: `${baseUrl}${$(item).find('a').attr('href')}`,
                title: '',
            }));

        tasks = list.map((item) =>
            cache.tryGet(item.link, async () => {
                const page = await context.newPage();
                try {
                    await setCookies(page, cookies, 'journals.uchicago.edu');
                    await configurePage(page);
                    logger.http(`Requesting ${item.link}`);
                    await page.goto(item.link, {
                        waitUntil: 'domcontentloaded',
                        referer: link,
                    });
                    const response = await page.evaluate(() => document.documentElement.getHTML());
                    const $ = load(response);

                    item.title = $('head title').text();
                    item.pubDate = parseDate($('head meta[name="dc.Date"]').attr('content')!);
                    item.doi = $('head meta[scheme="doi"]').attr('content');
                    item.author = $('.author-name span')
                        .toArray()
                        .map((author) => $(author).text())
                        .join(', ');

                    $('.figure__image').each((_, elem) => {
                        if (!elem.attribs['data-lg-src']) {
                            return;
                        }

                        $(elem).attr('src', `${baseUrl}${elem.attribs['data-lg-src']}`);
                        delete elem.attribs['data-lg-src'];
                    });

                    item.description = $('.article__body').html();
                    return item;
                } finally {
                    await page.close();
                }
            })
        );
        const items = await Promise.all(tasks);
        return {
            title: $('head title').text(),
            description: $('.jumbotron-journal-info').text(),
            link,
            image: $('head meta[property="og:image"]').attr('content'),
            item: items,
            language: $('html').attr('lang') as Language,
        };
    } finally {
        await Promise.allSettled(tasks);
        await destroy();
    }
}
