import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.xbmu.edu.cn/xwzx/xsxx.htm';

async function fetchDetail(link: string): Promise<Pick<DataItem, 'description' | 'author'>> {
    const { data } = await got(link);
    const $ = load(data);
    const author =
        $('.infob > .titx')
            .text()
            .match(/作者[：:](.*?)(?=(?:编辑|审签|校审|发布时间)[：:]|$)/s)?.[1]
            .trim() || undefined;
    return { description: $('#vsb_content > div').html() ?? undefined, author };
}

async function mapResolvedValue<T, U>(promise: Promise<T>, mapper: (value: T) => U | Promise<U>): Promise<U> {
    const value = await promise;
    return mapper(value);
}

const handler: Route['handler'] = async () => {
    try {
        // Fetch the academic page
        const { data: listResponse } = await got(baseUrl);
        const $ = load(listResponse);

        // Select all list items containing academic information
        const itemSelector = 'body > div.container.list-container.ny_mani > div > div.news_list > ul > li';
        const listItems = $(itemSelector);

        // Map through each list item to extract details
        const academicLinkList = await Promise.all(
            listItems
                .toArray()
                .filter((element) => $(element).find('a').attr('href'))
                .map((element) => {
                    const rawDate = $(element).find('span').text();
                    const [day, yearMonth] = rawDate.split('/').map((s) => s.trim());
                    const parsedDate = yearMonth && day ? timezone(parseDate(`${yearMonth}-${day.padStart(2, '0')}`, 'YYYY-MM-DD', true), 8) : undefined;
                    const formattedDate = parsedDate && Number.isFinite(parsedDate.getTime()) ? parsedDate : undefined;

                    const title = $(element).find('a').attr('title') || '学术信息';
                    const relativeHref = $(element).find('a').attr('href') || '';
                    const link = new URL(relativeHref, baseUrl).href;

                    return {
                        date: formattedDate,
                        title,
                        link,
                    };
                })
        );

        return {
            title: '西北民族大学学术信息',
            description: '西北民族大学近日学术信息',
            link: baseUrl,
            item: (await pMap(
                academicLinkList,
                (item) =>
                    mapResolvedValue(
                        cache.tryGet(`xbmu:detail:v3:${item.link}`, () => fetchDetail(item.link)),
                        (detail) => ({
                            title: item.title,
                            pubDate: item.date,
                            link: item.link,
                            description: detail.description,
                            author: detail.author,
                            guid: item.link,
                            id: item.link,
                            language: 'zh-CN',
                        })
                    ),
                { concurrency: 3, stopOnError: false }
            )) as DataItem[],
            language: 'zh-CN',
            feedLink: 'https://rsshub.app/xbmu/academic',
            id: 'https://rsshub.app/xbmu/academic',
        };
    } catch (error) {
        throw new Error(`Error fetching academic information: ${error}`, { cause: error });
    }
};

export const route: Route = {
    path: '/academic',
    name: '学术信息',
    maintainers: ['PrinOrange'],
    handler,
    categories: ['university'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    example: '/xbmu/academic',
};
