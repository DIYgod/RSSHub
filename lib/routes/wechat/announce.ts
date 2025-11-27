import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/announce',
    categories: ['programming'],
    example: '/wechat/announce',
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
            source: ['mp.weixin.qq.com/cgi-bin/announce'],
        },
    ],
    name: '公众平台系统公告栏目',
    maintainers: ['xyqfer'],
    handler,
    url: 'mp.weixin.qq.com/cgi-bin/announce',
};

async function handler() {
    const { data: htmlString } = await got({
        method: 'get',
        url: 'https://mp.weixin.qq.com/cgi-bin/announce?action=getannouncementlist&lang=zh_CN',
    });

    const $ = load(htmlString);
    const announceList = [];

    $('.mp_news_list > .mp_news_item').each(function () {
        const $item = $(this);
        const $link = $item.find('a');
        const time = $item.find('.read_more').text();
        const title = $item.find('strong').text();

        announceList.push({
            title: `${time} ${title}`,
            link: `https://mp.weixin.qq.com${$link.attr('href')}`,
            description: title,
            pubDate: parseDate(time),
        });
    });

    return {
        title: '微信公众平台-系统公告栏目',
        link: 'https://mp.weixin.qq.com/cgi-bin/announce?action=getannouncementlist&lang=zh_CN',
        item: announceList,
    };
}
