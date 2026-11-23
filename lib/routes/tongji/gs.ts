import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';
import { fetchArticle, WeChatMpError } from '@/utils/wechat-mp';

export const route: Route = {
    path: '/gs',
    categories: ['university'],
    example: '/tongji/gs',
    parameters: {},
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
            source: ['gs.tongji.edu.cn/tzgg.htm', 'gs.tongji.edu.cn/'],
        },
    ],
    name: '研究生院通知公告',
    maintainers: ['sitdownkevin'],
    handler,
    url: 'gs.tongji.edu.cn/tzgg.htm',
};
async function getNoticeContent(link: string) {
    if (new URL(link).origin === 'https://mp.weixin.qq.com') {
        const { description } = await fetchArticle(link);
        return { description };
    }
    const { body } = await got(link);
    const $ = load(body);
    const content = $('.v_news_content');
    const attachments = content
        .closest('form')
        .find('ul')
        .filter((_, element) => content.toArray().every((node) => !$.contains(node, element)) && $(element).find('a[href*="news.DownloadAttachUrl"]').length > 0)
        .toArray()
        .map((element) => $.html(element))
        .join('');
    return { description: (content.html() ?? '') + attachments };
}
async function handler() {
    const baseUrl = 'https://gs.tongji.edu.cn';
    const response = await got(`${baseUrl}/tzgg.htm`);
    const $ = load(response.body);
    const container = $('body > div > div.con_list.ma0a > div > div.list_content_right > div.list_list > ul');
    const items = container
        .find('li')
        .toArray()
        .map((item) => {
            const title = $(item).find('a').attr('title')!;
            const linkRaw = $(item).find('a').attr('href');
            const link = linkRaw!.startsWith('http') ? linkRaw : `${baseUrl}/${linkRaw}`;
            const pubDate = $(item).find('span').text();
            return { title, link, pubDate: parseDate(pubDate, 'YYYY-MM-DD', 8) };
        });
    const itemsWithContent = await pMap(
        items,
        async (item) => {
            try {
                const detail = await cache.tryGet(`tongji:gs:public-body:v1:${item.link}`, () => getNoticeContent(item.link!));
                return { ...item, ...detail };
            } catch (error) {
                if (error instanceof WeChatMpError) {
                    return item;
                }
                throw error;
            }
        },
        { concurrency: 3, stopOnError: false }
    );
    return {
        title: '同济大学研究生院',
        link: baseUrl,
        description: '同济大学研究生院通知公告',
        image: 'https://upload.wikimedia.org/wikipedia/zh/f/f8/Tongji_University_Emblem.svg',
        icon: 'https://upload.wikimedia.org/wikipedia/zh/f/f8/Tongji_University_Emblem.svg',
        logo: 'https://upload.wikimedia.org/wikipedia/zh/f/f8/Tongji_University_Emblem.svg',
        item: itemsWithContent,
    };
}
