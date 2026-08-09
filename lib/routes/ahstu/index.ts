import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.ahstu.edu.cn';

const types = {
    akyw: { title: '安科要闻', url: '/index/akyw.htm' },
    tzgg: { title: '通知公告', url: '/index/tzgg.htm' },
    xsak: { title: '学术安科', url: '/index/xsak.htm' },
    xydt: { title: '校园动态', url: '/index/xydt.htm' },
    mtak: { title: '媒体聚焦', url: '/index/mtak.htm' },
    rwfc: { title: '人物风采', url: '/index/rwfc.htm', gallery: true },
    sjxy: { title: '视觉校园', url: '/index/sjxy.htm' },
};

export const route: Route = {
    path: '/:type?',
    categories: ['university'],
    example: '/ahstu/akyw',
    parameters: { type: '栏目类型，见下表，默认为 `akyw`' },
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
            source: ['ahstu.edu.cn/index/:type'],
            target: '/:type',
        },
    ],
    name: '官网通知与新闻',
    maintainers: ['JizzCruiy'],
    handler,
    description: `| 栏目 | type |
| ---- | ---- |
| 安科要闻 | akyw |
| 通知公告 | tzgg |
| 学术安科 | xsak |
| 校园动态 | xydt |
| 媒体聚焦 | mtak |
| 人物风采 | rwfc |
| 视觉校园 | sjxy |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'akyw';

    if (!Object.hasOwn(types, type)) {
        throw new InvalidParameterError('This type does not exist. Please refer to the documentation for the correct usage.');
    }

    const listUrl = `${baseUrl}${types[type].url}`;
    const { data: listResponse } = await got(listUrl);
    const $ = load(listResponse);

    // 人物风采是图片画廊结构（无日期），其他栏目为文本列表结构
    const isGallery = types[type].gallery === true;
    const listSelector = isGallery ? 'a.img-ul-tt' : 'a.rigthConBox-conList';

    const list = $(listSelector)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const result: DataItem = {
                title: isGallery ? $item.text().trim() : $item.find('.conListWord').text().trim(),
                link: new URL($item.attr('href')!, baseUrl).href,
            };
            if (!isGallery) {
                result.pubDate = parseDate($item.find('.conListTime').text().trim());
            }
            return result;
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                try {
                    const { data: detailResponse } = await got(item.link);
                    const $detail = load(detailResponse);

                    item.author = $detail('.list-infor')
                        .text()
                        .match(/作者：([^】]+)/)?.[1]
                        ?.trim();
                    item.description = $detail('.v_news_content').html();
                } catch {
                    // 详情页抓取失败时保留列表数据（标题/日期/链接），正文降级为空
                }

                return item;
            })
        )
    );

    return {
        title: `安徽科技工程大学 - ${types[type].title}`,
        link: listUrl,
        item: items,
    };
}
