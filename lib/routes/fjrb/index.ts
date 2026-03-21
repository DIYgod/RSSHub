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
    const hasText = $.text().replaceAll(/\s+/g, '').length > 0;
    const hasMedia = $('img, video, audio, source').length > 0;

    return hasText || hasMedia ? cleaned : undefined;
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
    const attachmentMedia = attachment('img, video, audio, source')
        .toArray()
        .map((item) => attachment.html(item))
        .filter(Boolean)
        .join('');

    if (!attachmentMedia) {
        return mainDescription;
    }

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

const getPageLabel = ($: CheerioAPI, pageId: string) => {
    const pageLink = $('#list a')
        .toArray()
        .find((item) => $(item).attr('href')?.includes(`node_${pageId}.html`));

    return pageLink ? $(pageLink).text().replaceAll(/\s+/g, ' ').trim() : `第${pageId}版`;
};

export const route: Route = {
    path: '/:id?',
    categories: ['traditional-media'],
    example: '/fjrb',
    parameters: { id: '版次，留空为当天全部版面，例如 `01`、`02`' },
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
            target: '/:id',
        },
    ],
    name: '电子报',
    maintainers: ['nczitzk'],
    handler,
    description: `| 版次 | 栏目 |
| ---- | ---- |
| 01   | 要闻 |
| 02   | 要闻 |
| 03   | 经济 |
| 04   | 社会 |
| 05   | 教育/文化 |
| 06   | 时事 |
| 07   | 理论周刊·求是 |
| 08   | 深读 |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id')?.padStart(2, '0');

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

    const pageId = id ?? '01';
    const padUrl = `${rootUrl}/pad/col/${yearMonth}/${day}/node_${pageId}.html`;
    const pageUrl = id ? `${rootUrl}/pc/col/${yearMonth}/${day}/node_${pageId}.html` : `${rootUrl}/pc/col/index.html`;

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

        if (!id || currentCategory.startsWith(pageId)) {
            list.push({
                title: a.text().trim(),
                link: new URL(href, padUrl).toString().replace('/pad/', '/pc/'),
                category: [currentCategory.replace(/^\d+版\s*/, '')],
            });
        }
    });

    if (id && list.length === 0) {
        throw new Error(`Edition ${pageId} was not found in the latest Fujian Daily issue.`);
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
        title: `福建日报${id ? ` - ${getPageLabel($, pageId)}` : ''}`,
        link: pageUrl,
        item: items,
    };
}
