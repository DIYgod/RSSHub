import { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

const BASE_URL = 'https://www.xbmu.edu.cn/xwzx/tzgg.htm';

const handler: Route['handler'] = async () => {
    try {
        // Fetch the announcements page
        const { data: listResponse } = await got(BASE_URL);
        const $ = load(listResponse);

        // Select all list items containing announcement information
        const ITEM_SELECTOR = 'body > div.container.list-container.ny_mani > div > div.news_list > ul > li';
        const listItems = $(ITEM_SELECTOR);

        // Map through each list item to extract details
        const announcementLinkList = await Promise.all(
            listItems.toArray().map((element) => {
                const rawDate = $(element).find('span').text().trim();
                const [day, yearMonth] = rawDate.split('/').map((s) => s.trim());
                const formattedDate = parseDate(`${yearMonth}-${day}`).toUTCString();

                const title = $(element).find('a').attr('title') || '通知公告';
                const relativeHref = $(element).find('a').attr('href') || '';
                const link = `https://www.xbmu.edu.cn/${relativeHref.replaceAll('../', '')}`;

                return {
                    date: formattedDate,
                    title,
                    link,
                };
            })
        );

        return {
            title: '西北民族大学通知公告',
            description: '西北民族大学近日通知公告',
            link: BASE_URL,
            image: 'http://210.26.0.114:9090/mdxg/img/weex/default_img.jpg',
            item: (await Promise.all(
                announcementLinkList.map((item) =>
                    cache.tryGet(item.link, async () => {
                        const CONTENT_SELECTOR = '#vsb_content > div';
                        const { data: contentResponse } = await got(item.link);
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
                            image: 'http://210.26.0.114:9090/mdxg/img/weex/default_img.jpg',
                            content,
                            updated: item.date,
                            language: 'zh-cn',
                        };
                    })
                )
            )) as DataItem[],
            allowEmpty: true,
            language: 'zh-cn',
            feedLink: 'https://rsshub.app/xbmu/announcement',
            id: 'https://rsshub.app/xbmu/announcement',
        };
    } catch (error) {
        throw new Error(`Error fetching announcements: ${error}`);
    }
};

export const route: Route = {
    path: '/announcement',
    name: '通知公告',
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
    example: '/xbmu/announcement',
};
