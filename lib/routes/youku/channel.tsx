import path from 'node:path';

import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/channel/:channelId/:embed?',
    categories: ['multimedia'],
    example: '/youku/channel/UNTg3MTM3OTcy',
    parameters: { channelId: '频道 id', embed: '默认为开启内嵌视频, 任意值为关闭' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['i.youku.com/i/:id'],
            target: '/channel/:id',
        },
    ],
    name: '频道',
    maintainers: ['xyqfer', 'Fatpandac'],
    handler,
};

async function handler(ctx) {
    const channelId = ctx.req.param('channelId');
    const embed = !ctx.req.param('embed');

    const response = await got({
        method: 'get',
        url: `https://i.youku.com/i/${channelId}/videos`,
        headers: {
            Host: 'i.youku.com',
            Referer: `https://i.youku.com/i/${channelId}`,
        },
    });

    const data = response.data;
    const $ = load(data);
    const list = $('div.videoitem_pack');

    return {
        title: $('.username').text(),
        link: `https://i.youku.com/i/${channelId}`,
        description: $('.desc').text(),
        item: list
            .toArray()
            .map((item) => {
                item = $(item);
                const title = item.find('a.videoitem_videolink').attr('title');
                const cover = item.find('a.videoitem_videolink > img').attr('src');
                const $link = item.find('a.videoitem_videolink');
                const link = $link.length > 0 ? `https:${$link.attr('href')}` : null;
                const dateText = item.find('p.videoitem_subtitle').text().split('-').length === 2 ? `${new Date().getFullYear()}-${item.find('p.videoitem_subtitle').text()}` : item.find('p.videoitem_subtitle').text();
                const pubDate = parseDate(dateText);

                if (!link) {
                    return null;
                }

                const description = embed
                    ? renderToString(<iframe height={498} width={510} src={`https://player.youku.com/embed/${path.parse(link).name.replaceAll(/^id_/g, '')}`} frameBorder="0" allowFullScreen />)
                    : cover
                      ? renderToString(<img src={cover} />)
                      : undefined;

                return {
                    title,
                    description,
                    link,
                    pubDate,
                };
            })
            .filter(Boolean),
    };
}
