import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const ROOT_URL = 'https://fjrb.fjdaily.com';

const removeComments = (element) => {
    element
        .contents()
        .filter((_, node) => node.type === 'comment')
        .remove();
    element
        .find('*')
        .contents()
        .filter((_, node) => node.type === 'comment')
        .remove();
};

const getNormalizedHtml = (element) => {
    removeComments(element);
    element.find('img, video, audio, source').removeAttr('referrerpolicy');

    return element.html()?.trim();
};

const hasMeaningfulContent = (element) => {
    const text = element.text().replaceAll(/\s+/g, '');
    const media = element.find('img, video, audio, source').length;

    return text.length > 0 || media > 0;
};

const getDescription = (element) => {
    const normalizedHtml = getNormalizedHtml(element);

    if (!normalizedHtml || !hasMeaningfulContent(element)) {
        return;
    }

    return normalizedHtml;
};

const getNodeSrc = (node: Element) => node.attribs?.src;

const getAttachmentDescription = (attachment) => getDescription(attachment);

const getNewMediaHtml = (detail: CheerioAPI, attachment, mainMediaSources: Set<string>) =>
    attachment
        .find('img, video, audio, source')
        .toArray()
        .filter((item: Element) => {
            const src = getNodeSrc(item);
            return src && !mainMediaSources.has(src);
        })
        .map((item) => detail(item).prop('outerHTML'))
        .filter(Boolean)
        .join('');

const mergeDescription = (detail: CheerioAPI, mainDescription: string | undefined, attachment, mainMediaSources: Set<string>) => {
    if (!mainDescription) {
        return getAttachmentDescription(attachment);
    }

    const newMediaHtml = getNewMediaHtml(detail, attachment, mainMediaSources);
    return newMediaHtml ? `${newMediaHtml}${mainDescription}` : mainDescription;
};

const getItemDescription = (detail: CheerioAPI) => {
    const mainContent = detail('#content');
    const attachment = detail('.attachment');
    const mainDescription = getDescription(mainContent);
    const mainMediaSources = new Set(
        mainContent
            .find('img, video, audio, source')
            .toArray()
            .map((item: Element) => getNodeSrc(item))
            .filter(Boolean)
    );

    return mergeDescription(detail, mainDescription, attachment, mainMediaSources);
};

const getIssueDate = async (date: string | undefined) => {
    if (date) {
        if (!/^\d{8}$/.test(date)) {
            throw new Error('Invalid date format. Expected YYYYMMDD, for example `20260316`. ');
        }

        return {
            yearMonth: date.slice(0, 6),
            day: date.slice(6, 8),
        };
    }

    const indexResponse = await got(`${ROOT_URL}/pc/col/index.html`);
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
    example: '/fjdaily/20260316',
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
    maintainers: ['DakoWang'],
    handler,
    description: '留空时抓取最新一期全部版面，也可以通过日期参数抓取指定日期的全部版面内容。',
};

async function handler(ctx) {
    const date = ctx.req.param('date');
    const { yearMonth, day } = await getIssueDate(date);
    const padUrl = `${ROOT_URL}/pad/col/${yearMonth}/${day}/node_01.html`;
    const pageUrl = `${ROOT_URL}/pc/col/${yearMonth}/${day}/node_01.html`;

    const pageResponse = await got(padUrl);
    const content = load(pageResponse.data);

    let currentCategory = '';
    const list: DataItem[] = content('#catalog li')
        .toArray()
        .map((item) => {
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

            return {
                title: a.text().replaceAll(/\s+/g, ' ').trim(),
                link: new URL(href, padUrl).toString().replace('/pad/', '/pc/'),
                category: [currentCategory.replace(/^\d+版\s*/, '')],
            };
        })
        .filter((item): item is DataItem => item !== undefined);

    if (list.length === 0) {
        throw new Error(`No articles were found for ${yearMonth}${day}.`);
    }

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await got(item.link!);
                const detail = load(detailResponse.data);
                const pubDate = detail('#NewsArticlePubDay').text().trim();
                const author = detail('#NewsArticleAuthor').text().trim();
                const description = getItemDescription(detail);

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
