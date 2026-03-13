import { load } from 'cheerio';

import NotFoundError from '@/errors/types/not-found';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { processEmbedPDF } from '../lib/embed-resource';

const WEBSITE_LOGO = 'https://www.nwnu.edu.cn/_upload/tpl/02/d9/729/template729/favicon.ico';
const BASE_URL = 'https://jwc.nwnu.edu.cn/';

const COLUMNS: Record<string, { title: string; description: string }> = {
    tzgg: {
        title: '通知公告',
        description: '西北师范大学教务处通知公告',
    },
    jwkx: {
        title: '教务快讯',
        description: '西北师范大学教务快讯',
    },
};

const handler: Route['handler'] = async (ctx) => {
    const columnParam = ctx.req.param('column');
    if (COLUMNS[columnParam] === undefined) {
        throw new NotFoundError(`The column ${columnParam} does not exist`);
    }
    const columnTitle = COLUMNS[columnParam].title;
    const columnDescription = COLUMNS[columnParam].description;
    const columnPageUrl = `https://jwc.nwnu.edu.cn/${columnParam}/list.htm`;

    // Fetch the list page
    const { data: listResponse } = await got(columnPageUrl);
    const $ = load(listResponse);

    // Select all list items containing academic information
    const ITEM_SELECTOR = 'div.list_index > ul > li';
    const listItems = $(ITEM_SELECTOR);

    // Map through each list item to extract details
    const itemLinks = listItems.toArray().map((element) => {
        const title = $(element).find('span.f > a').text()!;
        const date = parseDate($(element).find('span.r').text()!);
        const relativeLink = $(element).find('span.f > a').attr('href')!;
        const link = new URL(relativeLink, BASE_URL).href;
        return {
            title,
            date,
            link,
        };
    });

    return {
        title: columnTitle,
        description: columnDescription,
        link: columnPageUrl,
        image: WEBSITE_LOGO,
        item: (await Promise.all(
            itemLinks.map((item) =>
                cache.tryGet(item.link, async () => {
                    const CONTENT_SELECTOR = 'div.wp_articlecontent';
                    const { data: contentResponse } = await got(item.link);
                    const contentPage = load(contentResponse);
                    const content = processEmbedPDF(BASE_URL, contentPage(CONTENT_SELECTOR).html() || '');
                    return {
                        title: item.title,
                        pubDate: item.date,
                        link: item.link,
                        description: content,
                        category: ['university'],
                        guid: item.link,
                        id: item.link,
                        image: WEBSITE_LOGO,
                        content,
                        updated: item.date,
                        language: 'zh-CN',
                    };
                })
            )
        )) as DataItem[],
        allowEmpty: true,
        language: 'zh-CN',
        feedLink: `https://rsshub.app/nwnu/department/academic-affairs/${columnParam}`,
        id: `https://rsshub.app/nwnu/department/academic-affairs/${columnParam}`,
    };
};

export const route: Route = {
    path: '/department/academic-affairs/:column',
    name: '教务处',
    maintainers: ['PrinOrange'],
    handler,
    categories: ['university'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportRadar: true,
        supportPodcast: false,
        supportScihub: false,
    },
    example: '/department/academic-affairs/tzgg',
    radar: [
        {
            source: ['jwc.nwnu.edu.cn/:column/list.htm'],
            target: '/department/academic-affairs/:column',
        },
    ],
    description: `
| column | 标题     | 描述                     |
| ------ | -------- | ------------------------ |
| tzgg   | 通知公告 | 西北师范大学教务通知公告 |
| jwkx   | 教务快讯 | 西北师范大学教务快讯     |`,
};
