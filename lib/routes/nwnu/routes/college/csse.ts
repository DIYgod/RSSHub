import NotFoundError from '@/errors/types/not-found';
import { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import { processEmbedPDF } from '../lib/embed-resource';

const WEBSITE_LOGO = 'https://jsj.nwnu.edu.cn/_upload/tpl/02/2e/558/template558/favicon.ico';
const BASE_URL = 'https://jsj.nwnu.edu.cn/';

const COLUMNS: Record<string, { title: string; description: string }> = {
    '2435': {
        title: '学院新闻',
        description: '计算机科学与工程 学院新闻',
    },
    '2436': {
        title: '通知公告',
        description: '计算机科学与工程 通知公告',
    },
    '2437': {
        title: '学术动态',
        description: '计算机科学与工程 学术动态',
    },
    '2446': {
        title: '研究生招生',
        description: '计算机科学与工程学院 研究生招生动态及相关新闻',
    },
    '8411': {
        title: '评估动态',
        description: '计算机科学与工程学院 院系学科评估动态',
    },
};

const handler: Route['handler'] = async (ctx) => {
    const columnParam = ctx.req.param('column');
    if (COLUMNS[columnParam] === undefined) {
        throw new NotFoundError(`The column ${columnParam} does not exist`);
    }
    const columnTitle = COLUMNS[columnParam].title;
    const columnDescription = COLUMNS[columnParam].description;
    const columnPageUrl = `https://jsj.nwnu.edu.cn/${columnParam}/list.htm`;

    // Fetch the list page
    const { data: listResponse } = await got(columnPageUrl);
    const $ = load(listResponse);

    // Select all list items containing academic information
    const ITEM_SELECTOR = 'ul > li.clearfix';
    const listItems = $(ITEM_SELECTOR);

    // Map through each list item to extract details
    const itemLinks = listItems.toArray().map((element) => {
        const title = $(element).find('div.right_list_text > p.p1 > a').text()!;
        const imgRelativeLink = $(element).find('div.right_list_img > a > img').attr('src') || WEBSITE_LOGO;
        const img = new URL(imgRelativeLink, BASE_URL).href;
        const relativeHref = $(element).find('div.right_list_text > p.p1 > a').attr('href')!;
        const link = new URL(relativeHref, BASE_URL).href;
        return {
            title,
            img,
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
                    const DATE_SELECTOR = 'div.sp2 > div > span:nth-child(1)';
                    const CONTENT_SELECTOR = 'div.artInfo';
                    const { data: contentResponse } = await got(item.link);
                    const contentPage = load(contentResponse);
                    const dateString = contentPage(DATE_SELECTOR).text();
                    const date = parseDate(dateString.replace('年', '-').replace('月', '-').replace('日', ''));
                    const content = processEmbedPDF(BASE_URL, contentPage(CONTENT_SELECTOR).html() || '');
                    return {
                        title: item.title,
                        pubDate: date,
                        link: item.link,
                        description: content,
                        category: ['university'],
                        guid: item.link,
                        id: item.link,
                        image: item.img,
                        content,
                        updated: date,
                        language: 'zh-CN',
                    };
                })
            )
        )) as DataItem[],
        allowEmpty: true,
        language: 'zh-CN',
        feedLink: `https://rsshub.app/nwnu/college/csse/${columnParam}`,
        id: `https://rsshub.app/nwnu/college/csse/${columnParam}`,
    };
};

export const route: Route = {
    path: '/college/csse/:column',
    name: '计算机科学与工程学院',
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
    example: '/college/csse/2435',
    radar: [
        {
            source: ['jsj.nwnu.edu.cn/:column/list'],
            target: '/college/csse/:column',
        },
    ],
    description: `
| column | 标题       | 描述                                          |
| ------ | ---------- | --------------------------------------------- |
| 2435   | 学院新闻   | 计算机科学与工程 学院新闻                     |
| 2436   | 通知公告   | 计算机科学与工程 通知公告                     |
| 2437   | 学术动态   | 计算机科学与工程 学术动态                     |
| 2446   | 研究生招生 | 计算机科学与工程学院 研究生招生动态及相关新闻 |
| 8411   | 评估动态   | 计算机科学与工程学院 院系学科评估动态         |`,
};
