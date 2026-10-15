import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { extractDoc, renderVideo } from './utils';

export const route: Route = {
    path: '/feng/:id/:type',
    categories: ['new-media'],
    example: '/ifeng/feng/2583/doc',
    parameters: { id: '对应 id，可在 大风号作者页面 找到', type: '类型，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '大风号',
    maintainers: ['Jamch'],
    handler,
    description: `| 文章 | 视频  |
| ---- | ----- |
| doc  | video |`,
};

function parseNewsDate(value: string) {
    const date = value?.trim() ? parseDate(value.trim(), 'YYYY-MM-DD HH:mm:ss', true) : undefined;
    return date && Number.isFinite(date.getTime()) ? timezone(date, 8) : undefined;
}

async function handler(ctx) {
    const { id, type } = ctx.req.param();
    const { data: userResponse } = await got(`https://ishare.ifeng.com/mediaShare/home/${id}/media`, {
        headers: {
            Referer: `https://feng.ifeng.com/author/${id}`,
        },
    });
    const { data: contentResponse } = await got(`https://shankapi.ifeng.com/season/ishare/getShareListData/${id}/${type}/1/ifengnewsh5/getListData`, {
        headers: {
            Referer: `https://feng.ifeng.com/author/${id}`,
        },
    });

    const $ = load(userResponse);
    const { sockpuppetInfo: allData } = JSON.parse(
        $('script')
            .text()
            .match(/var allData = (.*?);/)![1]
    );
    const { data: contentData } = JSON.parse(contentResponse.match(/getListData\((.*)\)/)[1]);
    const { weMediaName: mediaName, honorDesc, description, logo } = allData;

    const list: Array<DataItem & { link: string }> = contentData.map((item) => ({
        title: item.title,
        pubDate: parseNewsDate(item.newsTime),
        author: mediaName,
        link: new URL(item.url, 'https://ishare.ifeng.com').href,
    }));

    const items = await pMap(
        list,
        async (item) => {
            const response = await cache.tryGet(`ifeng:article-html:${item.link}`, async () => (await got(item.link)).data);
            const $ = load(response);
            const articleData = JSON.parse(
                $('script')
                    .text()
                    .match(/var allData = (\{.*?\});/)![1]
            );
            const description = type === 'doc' ? extractDoc(articleData.docData.contentData.contentList) : type === 'video' ? renderVideo(articleData.videoInfo) : undefined;
            return {
                ...item,
                description,
                category: articleData.keywords.split(','),
                author: articleData.docData?.editorName ?? item.author,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: `大风号-${mediaName}-${type === 'doc' ? '文章' : '视频'}`,
        description: `${honorDesc} ${description}`,
        image: `https:${logo}`,
        link: `https://ishare.ifeng.com/mediaShare/home/${id}/media`,
        item: items,
    };
}
