import { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import { generateRssItemForUnsupportedLink } from './utils/content';
import { isSubdomainOfGsau } from './utils/domain';

type NewsCategory = {
    title: string;
    description: string;
};

const NEWS_TYPES: Record<string, NewsCategory> = {
    xxyw: {
        title: '学校要闻',
        description: '甘肃农业大学学校要闻',
    },
    xykx: {
        title: '校园快讯',
        description: '甘肃农业大学校园快讯',
    },
    tzgg: {
        title: '通知公告',
        description: '甘肃农业大学校内通知公告',
    },
    jzbg: {
        title: '讲座报告',
        description: '甘肃农业大学讲座报告信息',
    },
    jqgz: {
        title: '近期关注',
        description: '甘肃农业大学近期关注',
    },
    jyjx: {
        title: '教育教学',
        description: '甘肃农业大学教育教学新闻',
    },
    xsky: {
        title: '学术科研',
        description: '甘肃农业大学学术科研信息',
    },
    hzjl: {
        title: '合作交流',
        description: '甘肃农业大学合作交流信息',
    },
    mzgn: {
        title: '每周甘农',
        description: '甘肃农业大学周记总结',
    },
    mtnd: {
        title: '媒体农大',
        description: '相关对甘肃农业大学的媒体报道',
    },
};

const handler: Route['handler'] = async (context) => {
    const { category } = context.req.param();

    if (!category || !NEWS_TYPES[category]) {
        throw new Error('Invalid category');
    }

    const BASE_URL = `https://www.gsau.edu.cn/xwzx/${category}.htm`;

    const { data: listResponse } = await got(BASE_URL);
    const $ = load(listResponse);

    // Select all list items containing news information
    const ITEM_SELECTOR = '#warp > div.nyleft > div.infolist > ul > li';
    const listItems = $(ITEM_SELECTOR);

    // Map through each list item to extract details
    const contentLinkList = (
        await Promise.all(
            listItems.toArray().map((element) => {
                const title = $(element).find('a').attr('title')?.trim();
                const date: string = parseDate($(element).find('a > span').text().trim()).toISOString();

                const relativeLink = $(element).find('a').attr('href') || '';
                const absoluteLink = new URL(relativeLink, BASE_URL).href;
                if (title && date && relativeLink) {
                    return { title, date, link: absoluteLink };
                }
                return null;
            })
        )
    ).filter((item) => item !== null);

    return {
        title: NEWS_TYPES[category].title,
        description: NEWS_TYPES[category].description,
        link: BASE_URL,
        image: 'https://www.gsau.edu.cn/images/foot_03.jpg',
        item: (await Promise.all(
            contentLinkList.map((item) =>
                cache.tryGet(item.link, async () => {
                    if (!isSubdomainOfGsau(item.link)) {
                        return generateRssItemForUnsupportedLink(item.title, item.date, item.link);
                    }
                    const { data: contentResponse } = await got(item.link);
                    const CONTENT_SELECTOR = '#warp > div.nyleft > form > div > div.infoarea > div';
                    const contentPage = load(contentResponse);
                    const content = contentPage(CONTENT_SELECTOR).html() || '';
                    return {
                        title: item.title,
                        pubDate: item.date,
                        link: item.link,
                        description: content,
                        category: ['university'],
                        guid: item.link,
                        id: item.link,
                        image: 'https://www.gsau.edu.cn/images/foot_03.jpg',
                        content,
                        updated: item.date,
                        language: 'zh-cn',
                    };
                })
            )
        )) as DataItem[],
        allowEmpty: true,
        language: 'zh-cn',
        feedLink: `https://rsshub.app/gsau/news/${category}`,
        id: BASE_URL,
    };
};

export const route: Route = {
    path: '/news/:category',
    name: '主页新闻',
    description: `
| 类型    | 标题       | 描述                         |
| ------- | ---------- | ---------------------------- |
| xxyw    | 学校要闻   | 甘肃农业大学学校要闻         |
| xykx    | 校园快讯   | 甘肃农业大学校园快讯         |
| tzgg    | 通知公告   | 甘肃农业大学校内通知公告     |
| jzbg    | 讲座报告   | 甘肃农业大学讲座报告信息     |
| jqgz    | 近期关注   | 甘肃农业大学近期关注         |
| jyjx    | 教育教学   | 甘肃农业大学教育教学新闻     |
| xsky    | 学术科研   | 甘肃农业大学学术科研信息     |
| hzjl    | 合作交流   | 甘肃农业大学合作交流信息     |
| mzgn    | 每周甘农   | 甘肃农业大学周记总结         |
| mtnd    | 媒体农大   | 相关对甘肃农业大学的媒体报道 |
    `,
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
    example: '/gsau/news/tzgg',
};
