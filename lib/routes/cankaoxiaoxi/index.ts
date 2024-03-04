// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const id = ctx.req.param('id') ?? 'diyi';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50;

    const rootUrl = 'https://china.cankaoxiaoxi.com';
    const listApiUrl = `${rootUrl}/json/channel/${id}/list.json`;
    const channelApiUrl = `${rootUrl}/json/channel/${id}.channeljson`;
    const currentUrl = `${rootUrl}/#/generalColumns/${id}`;

    const listResponse = await got({
        method: 'get',
        url: listApiUrl,
    });

    const channelResponse = await got({
        method: 'get',
        url: channelApiUrl,
    });

    let items = listResponse.data.list.slice(0, limit).map((item) => ({
        title: item.data.title,
        author: item.data.userName,
        category: item.data.channelName,
        pubDate: timezone(parseDate(item.data.publishTime), +8),
        link: item.data.moVideoPath ? item.data.sourceUrl : `${rootUrl}/json/content/${item.data.url.match(/\/pages\/(.*?)\.html/)[1]}.detailjson`,
        video: item.data.moVideoPath,
        cover: item.data.mCoverImg,
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (item.video) {
                    item.description = art(path.join(__dirname, 'templates/description.art'), {
                        video: item.video,
                        cover: item.cover,
                    });
                } else {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const data = detailResponse.data;

                    item.link = `${rootUrl}/#/detailsPage/${id}/${data.id}/1/${data.publishTime.split(' ')[0]}`;
                    item.description = data.txt;
                }

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `参考消息 - ${channelResponse.data.name}`,
        link: currentUrl,
        description: '参考消息',
        language: 'zh-cn',
        item: items,
    });
};
