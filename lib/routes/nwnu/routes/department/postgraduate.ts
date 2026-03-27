import { load } from 'cheerio';

import NotFoundError from '@/errors/types/not-found';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { processEmbedPDF } from '../lib/embed-resource';

const WEBSITE_LOGO = 'https://www.nwnu.edu.cn/_upload/tpl/02/d9/729/template729/favicon.ico';
const BASE_URL = 'https://yjsy.nwnu.edu.cn/';

const COLUMNS: Record<string, { title: string; description: string }> = {
    '2701': {
        title: '招生工作（包括硕士、博士招生）',
        description: '研究生院招生信息（包含硕士招生和博士招生两个栏目）',
    },
    '2738': {
        title: '工作动态',
        description: '研究生院工作动态',
    },
    '2712': {
        title: '博士招生',
        description: '研究生院博士研究生招生信息',
    },
    '2713': {
        title: '硕士招生',
        description: '研究生院硕士研究生招生信息',
    },
    '2702': {
        title: '培养工作',
        description: '培养工作栏目信息汇总',
    },
    '2703': {
        title: '学科建设',
        description: '研究生院学科建设信息汇总',
    },
    '2704': {
        title: '学位工作',
        description: '研究生院学位工作栏目信息汇总',
    },
};

const handler: Route['handler'] = async (ctx) => {
    const columnParam = ctx.req.param('column');
    if (COLUMNS[columnParam] === undefined) {
        throw new NotFoundError(`The column ${columnParam} does not exist`);
    }
    const columnTitle = COLUMNS[columnParam].title;
    const columnDescription = COLUMNS[columnParam].description;
    const columnPageUrl = `https://yjsy.nwnu.edu.cn/${columnParam}/list.htm`;

    // Fetch the list page
    const { data: listResponse } = await got(columnPageUrl);
    const $ = load(listResponse);

    // Select all list items containing academic information
    const ITEM_SELECTOR = '#AjaxList > ul > li.a-list';
    const listItems = $(ITEM_SELECTOR);

    // Map through each list item to extract details
    const itemLinks = listItems.toArray().map((element) => {
        const title = $(element).find('a:nth-child(2)').attr('title')!;
        const date = parseDate($(element).find('span.pdate').text()!);
        const relativeLink = $(element).find('a:nth-child(2)').attr('href')!;
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
                    const CONTENT_SELECTOR = 'div.content_div';
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
        feedLink: `https://rsshub.app/nwnu/department/postgraduate/${columnParam}`,
        id: `https://rsshub.app/nwnu/department/postgraduate/${columnParam}`,
    };
};

export const route: Route = {
    path: '/department/postgraduate/:column',
    name: '研究生院',
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
    example: '/department/postgraduate/2701',
    radar: [
        {
            source: ['yjsy.nwnu.edu.cn/:column/list.htm'],
            target: '/department/postgraduate/:column',
        },
    ],
    description: `
| column | 标题                           | 描述                                               |
| ------ | ------------------------------ | -------------------------------------------------- |
| 2701   | 招生工作（包括硕士、博士招生） | 研究生院招生信息（包含硕士招生和博士招生两个栏目） |
| 2712   | 博士招生                       | 研究生院博士研究生招生信息                         |
| 2713   | 硕士招生                       | 研究生院硕士研究生招生信息                         |
| 2702   | 培养工作                       | 培养工作栏目信息汇总                               |
| 2703   | 学科建设                       | 研究生院学科建设信息汇总                           |
| 2704   | 学位工作                       | 研究生院学位工作栏目信息汇总                       |`,
};
