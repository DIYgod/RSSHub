import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://bgm.tv';

export const route: Route = {
    path: '/group/:id',
    categories: ['anime'],
    example: '/bangumi.tv/group/boring',
    parameters: { id: '小组 id, 在小组页面地址栏查看' },
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
            source: ['bgm.tv/group/:id'],
        },
    ],
    name: '小组话题',
    maintainers: ['SettingDust'],
    handler,
};

async function handler(ctx) {
    const groupID = ctx.req.param('id');
    const link = `${baseUrl}/group/${groupID}/forum`;
    const html = await ofetch(link);
    const $ = load(html);
    const title = 'Bangumi - ' + $('.SecondaryNavTitle').text();

    const items = await Promise.all(
        $('.topic_list .topic')
            .toArray()
            .map((elem) => {
                const link = new URL($('.subject a', elem).attr('href'), baseUrl).href;
                return cache.tryGet(link, async () => {
                    const html = await ofetch(link);
                    const $ = load(html);
                    const fullText = $('.postTopic .topic_content').html();
                    const summary = 'Reply: ' + $('.posts', elem).text();
                    return {
                        link,
                        title: $('.subject a', elem).attr('title'),
                        pubDate: parseDate($('.lastpost .time', elem).text()),
                        description: fullText ? summary + '<br><br>' + fullText : summary,
                        author: $('.author a', elem).text(),
                    };
                });
            })
    );

    return {
        title,
        link,
        item: items,
    };
}
