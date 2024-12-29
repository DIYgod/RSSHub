import { Data, DataItem, Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import dayjs from 'dayjs';

const BASE_URL = 'https://www.xbmu.edu.cn/xwzx/xsxx.htm';
const ITEM_LIMIT = 15;

/**
 * Fetch and parse the academic information for Northwestern Minzu University.
 * @returns {Promise<Data>} Parsed academic information in RSS format.
 */
const handler: Route['handler'] = async () => {
    const result: Data = {
        title: '西北民族大学学术信息',
        description: '西北民族大学近日学术公告',
        image: 'http://210.26.0.114:9090/mdxg/img/weex/default_img.jpg',
        link: BASE_URL,
        item: [],
        allowEmpty: true,
        language: 'zh-cn',
        feedLink: 'https://rsshub.app/xbmu/academic',
        id: 'https://rsshub.app/xbmu/academic',
    };

    try {
        // Fetch the academic announcements page
        const { data: listResponse } = await got(BASE_URL);
        const $ = load(listResponse);

        // Select all list items containing academic information
        const ITEM_SELECTOR = 'body > div.container.list-container.ny_mani > div > div.news_list > ul > li';
        const listItems = $(ITEM_SELECTOR);

        // Map through each list item to extract details
        const academicList = await Promise.all(
            listItems.toArray().map(async (element) => {
                const rawDate = $(element).find('span').text().trim();
                const [day, yearMonth] = rawDate.split('/').map((s) => s.trim());
                const formattedDate = dayjs(`${yearMonth}-${day}`).toDate().toUTCString();

                const title = $(element).find('a').attr('title') || '学术信息';
                const relativeHref = $(element).find('a').attr('href') || '';
                const link = `https://www.xbmu.edu.cn/${relativeHref.replaceAll('../', '')}`;

                const CONTENT_SELECTOR = '#vsb_content > div';
                const { data: contentResponse } = await got(link);
                const contentPage = load(contentResponse);
                const content = contentPage(CONTENT_SELECTOR).html() || '';

                return {
                    date: formattedDate,
                    title,
                    link,
                    content,
                };
            })
        );

        // Format the academic information into DataItems
        const dataItems: DataItem[] = academicList.map((item) => ({
            title: item.title,
            pubDate: item.date,
            link: item.link,
            description: item.content,
            category: ['university'],
            guid: item.link,
            id: item.link,
            image: 'http://210.26.0.114:9090/mdxg/img/weex/default_img.jpg',
            content: {
                html: item.content,
                text: item.content,
            },
            updated: item.date,
            language: 'zh-cn',
        }));
        result.item = dataItems.slice(0, ITEM_LIMIT);
    } catch (error) {
        throw new Error(`Error fetching academic information: ${error}`);
    }
    return result;
};

export const route: Route = {
    path: '/academic',
    name: '学术信息',
    maintainers: ['prinOrange'],
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
