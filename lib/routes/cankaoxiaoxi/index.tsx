import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: ['/column/:id?', '/:id?'],
    categories: ['traditional-media'],
    example: '/cankaoxiaoxi/column/diyi',
    parameters: { id: '栏目 id，默认为 `diyi`，即第一关注' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '栏目',
    maintainers: ['yuxinliu-alex', 'nczitzk'],
    handler,
    description: `| 栏目           | id       |
| -------------- | -------- |
| 第一关注       | diyi     |
| 中国           | zhongguo |
| 国际           | gj       |
| 观点           | guandian |
| 锐参考         | ruick    |
| 体育健康       | tiyujk   |
| 科技应用       | kejiyy   |
| 文化旅游       | wenhualy |
| 参考漫谈       | cankaomt |
| 研究动态       | yjdt     |
| 海外智库       | hwzk     |
| 业界信息・观点 | yjxx     |
| 海外看中国城市 | hwkzgcs  |
| 译名趣谈       | ymymqt   |
| 译名发布       | ymymfb   |
| 双语汇         | ymsyh    |
| 参考视频       | video    |
| 军事           | junshi   |
| 参考人物       | cankaorw |`,
};

async function handler(ctx) {
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
                    item.description = renderDescription(item.video, item.cover);
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

    return {
        title: `参考消息 - ${channelResponse.data.name}`,
        link: currentUrl,
        description: '参考消息',
        language: 'zh-cn',
        item: items,
    };
}

const renderDescription = (video: string | undefined, cover: string | undefined): string =>
    renderToString(
        <>
            {video ? (
                <video controls poster={cover}>
                    <source src={video} type="video/mp4" />
                </video>
            ) : null}
        </>
    );
