import path from 'node:path';

import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateStrict } from '@/utils/time';

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
function parsePublicationDate(value: string) {
    const match = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/.exec(value);
    if (!match) {
        return;
    }
    const [, year, month, day, hour = '0', minute = '0', second = '0'] = match;
    return parseDateStrict(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`, 'YYYY-MM-DD HH:mm:ss', 8);
}
function getProfileDescription($: CheerioAPI) {
    const script = $('script')
        .toArray()
        .map((element) => $(element).text())
        .find((content) => content.trimStart().startsWith('window.__INITIAL_DATA__'));
    const match = script && /^\s*window\.__INITIAL_DATA__\s*=\s*(\{[\s\S]*\})\s*;\s*window\.__ENV__/.exec(script);
    if (!match) {
        return;
    }
    return JSON.parse(match[1]).data.componentList.find((component) => component.type === 'user').moduleList[0].data.description;
}
function getVideoCategory($: CheerioAPI) {
    return $('script[type="application/ld+json"]')
        .toArray()
        .flatMap((element) => JSON.parse($(element).text())['@graph'])
        .find((object) => object['@type'] === 'VideoObject')?.genre;
}
function getVideoCaption($: CheerioAPI) {
    return $('meta[name="description"]')
        .attr('content')
        ?.match(/视频内容简介[：:]([\s\S]*)$/)?.[1];
}
async function handler(ctx): Promise<Data> {
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
    const items = list.toArray().flatMap((item) => {
        const $item = $(item);
        const title = $item.find('a.videoitem_videolink').attr('title')!;
        const cover = $item.find('a.videoitem_videolink > img').attr('src');
        const $link = $item.find('a.videoitem_videolink');
        const href = $link.attr('href');
        const publicationDateText = $item.find('p.videoitem_subtitle').text();
        if (!href) {
            return [];
        }
        const link = new URL(href, 'https://i.youku.com').href;
        const description = embed
            ? renderToString(<iframe height={498} width={510} src={`https://player.youku.com/embed/${path.parse(new URL(link).pathname).name.replaceAll(/^id_/g, '')}`} frameBorder="0" allowFullScreen />)
            : cover
              ? renderToString(<img src={cover} />)
              : undefined;
        return {
            title,
            description,
            link,
            publicationDateText,
        };
    });
    return {
        title: $('.userinfo_usernickname').text(),
        link: `https://i.youku.com/i/${channelId}`,
        description: getProfileDescription($),
        item: await pMap(
            items,
            async ({ publicationDateText, ...item }) => {
                const { published, category, caption } = await cache.tryGet(`youku:metadata:v2:${item.link}`, async () => {
                    const response = await got(item.link);
                    const $ = load(response.data);
                    return { published: $('meta[itemprop="datePublished"]').attr('content'), category: getVideoCategory($), caption: getVideoCaption($) };
                });
                return {
                    ...item,
                    description: caption ? `${renderToString(<p>{caption}</p>)}${item.description ?? ''}` : item.description,
                    pubDate: parsePublicationDate(published ?? publicationDateText),
                    category,
                };
            },
            { concurrency: 3, stopOnError: false }
        ),
    };
}
