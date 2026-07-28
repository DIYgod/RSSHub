import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:channel?',
    categories: ['new-media'],
    example: '/biodiscover/reaseach',
    parameters: { channel: '频道，见下表' },
    radar: [
        {
            source: ['www.biodiscover.com/:channel'],
            target: '/:channel',
        },
    ],
    name: '频道',
    maintainers: ['aidistan'],
    handler,
    description: `| Research | Interview | Industry | Activity |
| -------- | --------- | -------- | -------- |
| reaseach | interview | industry | activity |`,
};

async function handler(ctx) {
    const channel = ctx.req.param('channel');
    const listUrl = 'http://www.biodiscover.com/' + channel;
    const response = await got({ url: listUrl });
    const $ = load(response.data);

    const items = $('.new_list .newList_box')
        .toArray()
        .map((item) => ({
            pubDate: parseDate($(item).find('.news_flow_tag .times').text().trim()),
            link: 'http://www.biodiscover.com' + $(item).find('h2 a').attr('href'),
        }));

    return {
        title: '生物探索 - ' + $('.header li.sel a').text(),
        link: listUrl,
        description: $('meta[name=description]').attr('content'),
        item: await Promise.all(
            items.map((item) =>
                cache.tryGet(item.link, async () => {
                    const detailResponse = await got({ url: item.link });
                    const $ = load(detailResponse.data);

                    // remove sharing info if exists
                    const lastNode = $('.main_info').children().last();
                    if (lastNode.css('display') === 'none') {
                        lastNode.remove();
                    }

                    return {
                        title: $('h1').text().trim(),
                        description: $('.main_info').html(),
                        pubDate: item.pubDate,
                        link: item.link,
                    };
                })
            )
        ),
    };
}
