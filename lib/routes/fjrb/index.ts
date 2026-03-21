import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://fjrb.fjdaily.com';

const getDescription = (html: string | null | undefined) => {
    const cleaned = html?.replaceAll(/<!--[\s\S]*?-->/g, '').trim();

    if (!cleaned) {
        return;
    }

    const $ = load(cleaned);
    $('img, video, audio, source').removeAttr('referrerpolicy');
    const hasText = $.text().replaceAll(/\s+/g, '').length > 0;
    const hasMedia = $('img, video, audio, source').length > 0;

    return hasText || hasMedia ? $.html() : undefined;
};

const getAttachmentDescription = ($: CheerioAPI) => getDescription($('.attachment').html());

const mergeDescription = (mainDescription: string | undefined, attachmentDescription: string | undefined) => {
    if (!mainDescription) {
        return attachmentDescription;
    }

    if (!attachmentDescription) {
        return mainDescription;
    }

    const main = load(mainDescription);
    const attachment = load(attachmentDescription);
    const mainMediaSources = new Set(
        main('img, video, audio, source')
            .toArray()
            .map((item) => main(item).attr('src'))
            .filter(Boolean)
    );

    const newMedia = attachment('img, video, audio, source')
        .toArray()
        .filter((item) => {
            const src = attachment(item).attr('src');
            return src && !mainMediaSources.has(src);
        })
        .map((item) => attachment.html(item))
        .filter(Boolean)
        .join('');

    return newMedia ? `${newMedia}${mainDescription}` : mainDescription;
};

const getIssueDate = async (date: string | undefined) => {
    if (date) {
        if (!/^\d{8}$/.test(date)) {
            throw new Error('Invalid date format. Expected YYYYMMDD, for example `20260316`.');
        }

        return {
            yearMonth: date.slice(0, 6),
            day: date.slice(6, 8),
        };
    }

    const indexResponse = await got(`${rootUrl}/pc/col/index.html`);
    const $ = load(indexResponse.data);
    const latestPath = $('#list li:first-child a').attr('href');

    if (!latestPath) {
        throw new Error('Failed to locate the latest Fujian Daily edition.');
    }

    const [, yearMonth, day] = latestPath.match(/(\d{6})\/(\d{2})\/node_\d+\.html/) ?? [];

    if (!yearMonth || !day) {
        throw new Error('Failed to parse the latest Fujian Daily edition date.');
    }

    return {
        yearMonth,
        day,
    };
};

export const route: Route = {
    path: '/:date?',
    categories: ['traditional-media'],
    example: '/fjrb/20260316',
    parameters: { date: '日期，格式为 `YYYYMMDD`，留空时抓取当天全部版面，例如 `20260316`' },
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
            source: ['fjrb.fjdaily.com/pc/col/index.html'],
            target: '/',
        },
        {
            source: ['fjrb.fjdaily.com/pc/col/:yearmonth/:day/node_:id.html'],
        },
    ],
    name: '电子报',
    maintainers: ['nczitzk'],
    handler,
    description: '留空时抓取最新一期全部版面，也可以通过日期参数抓取指定日期的全部版面内容。',
};

async function handler(ctx) {
    const date = ctx.req.param('date');
    const { yearMonth, day } = await getIssueDate(date);
    const padUrl = `${rootUrl}/pad/col/${yearMonth}/${day}/node_01.html`;
    const pageUrl = `${rootUrl}/pc/col/${yearMonth}/${day}/node_01.html`;

    const pageResponse = await got(padUrl);
    const content = load(pageResponse.data);

    let currentCategory = '';
    const list: Array<{ title: string; link: string; category: string[] }> = [];

    content('#catalog li').each((_, item) => {
        const element = content(item);
        if (element.hasClass('verson')) {
            currentCategory = element.text().replaceAll(/\s+/g, ' ').trim();
            return;
        }

        const a = element.find('a').first();
        const href = a.attr('href');
        if (!href) {
            return;
        }

        list.push({
            title: a.text().replaceAll(/\s+/g, ' ').trim(),
            link: new URL(href, padUrl).toString().replace('/pad/', '/pc/'),
            category: [currentCategory.replace(/^\d+版\s*/, '')],
        });
    });

    if (list.length === 0) {
        throw new Error(`No articles were found for ${yearMonth}${day}.`);
    }

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const detail = load(detailResponse.data);
                const pubDate = detail('#NewsArticlePubDay').text().trim();
                const author = detail('#NewsArticleAuthor').text().trim();
                const mainDescription = getDescription(detail('#content').html()) || getDescription(detail('#ozoom').html());
                const attachmentDescription = getAttachmentDescription(detail);
                const description = mergeDescription(mainDescription, attachmentDescription);

                return {
                    ...item,
                    author: author || undefined,
                    description: description || undefined,
                    pubDate: pubDate ? timezone(parseDate(pubDate), 8) : undefined,
                };
            })
        )
    );

    return {
        title: `福建日报 - ${yearMonth.slice(0, 4)}-${yearMonth.slice(4, 6)}-${day}`,
        link: pageUrl,
        item: items,
    };
}
