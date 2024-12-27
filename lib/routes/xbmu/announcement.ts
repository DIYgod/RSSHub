// Announcement for Northwestern Minzu University
// Website https://www.xbmu.edu.cn/xwzx/tzgg.htm
import { Data, DataItem, Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import dayjs from 'dayjs';

const BASE_URL = 'https://www.xbmu.edu.cn/xwzx/tzgg.htm';
const ITEM_LIMIT = 20;

/**
 * Fetch and parse the announcement announcements for Northwestern Minzu University.
 * @returns {Promise<Data>} Parsed announcement information in RSS format.
 */
const handler: Route['handler'] = async () => {
    const result: Data = {
        title: '西北民族大学通知公告',
        description: '西北民族大学近日通知公告',
        link: BASE_URL,
        image: 'https://www.xbmu.edu.cn/images/logo.png',
        item: [],
        allowEmpty: true,
        language: 'zh-cn',
        feedLink: 'https://rsshub.app/xbmu/announcement',
        id: 'https://rsshub.app/xbmu/announcement',
    };

    try {
        // Fetch the announcements page
        const { data: listResponse } = await got(BASE_URL);
        const $ = load(listResponse);

        // Select all list items containing announcement information
        const ITEM_SELECTOR = 'body > div.container.list-container.ny_mani > div > div.news_list > ul > li';
        const listItems = $(ITEM_SELECTOR);

        // Map through each list item to extract details
        const announcementList = await Promise.all(
            listItems
                .map(async (_, element) => {
                    const rawDate = $(element).find('span').text().trim();
                    const [day, yearMonth] = rawDate.split('/').map((s) => s.trim());
                    const formattedDate = dayjs(`${yearMonth}-${day}`).toDate().toUTCString();

                    const title = $(element).find('a').attr('title') || '学术信息';
                    const relativeHref = $(element).find('a').attr('href') || '';
                    const link = `https://www.xbmu.edu.cn/${relativeHref.replace('../', '')}`;

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
                .get()
        );

        // Format the announcement information into DataItems
        const dataItems: DataItem[] = announcementList.map((item) => ({
            title: item.title,
            pubDate: item.date,
            link: item.link,
            description: item.content,
            category: ['university'],
            guid: item.link,
            id: item.link,
            image: 'https://www.xbmu.edu.cn/images/logo.png',
            content: {
                html: item.content,
                text: item.content,
            },
            updated: item.date,
            language: 'zh-cn',
        }));
        result.item = dataItems.slice(0, ITEM_LIMIT);
    } catch (error) {
        throw new Error(`Error fetching announcement announcements: ${error}`);
    }
    return result;
};

export const route: Route = {
    path: '/announcement',
    name: '西北民族大学学术信息',
    maintainers: ['codemetic'],
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
    example: '/announcement',
};
