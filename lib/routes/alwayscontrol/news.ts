import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { finishArticleItem } from '@/utils/wechat-mp';

const baseUrl = 'https://www.alwayscontrol.com.cn';

export const route: Route = {
    path: '/news',
    categories: ['other'],
    example: '/alwayscontrol/news',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '最新动态',
    maintainers: ['moss-xxh'],
    url: 'alwayscontrol.com.cn',
    handler,
    radar: [
        {
            source: ['www.alwayscontrol.com.cn/zh-CN/about/news'],
            target: '/news',
        },
    ],
    description: 'Always Control（旭衡电子）智能能源管理系统解决方案专家的最新动态',
};

async function handler() {
    const listUrl = `${baseUrl}/zh-CN/about/news`;

    // 获取新闻列表页面
    const response = await got(listUrl);
    const $ = load(response.data);

    // 解析新闻列表
    const list = $('div.grid > a')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const image = $item.find('img').attr('src');

            return {
                title: $item.find('h3').text(),
                link: new URL($item.attr('href')!, baseUrl).href,
                pubDate: parseDate($item.find('h3').next().text(), 'YYYY.MM.DD'),
                image: image ? new URL(image, baseUrl).href : '',
            };
        });

    // 获取每篇新闻的详细内容
    const items = await Promise.all(
        list.map((item) => {
            if (new URL(item.link).host === 'mp.weixin.qq.com') {
                return finishArticleItem({ ...item, guid: item.link });
            }

            return cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const $detail = load(detailResponse.data);

                // 移除所有 class、style 等属性，但保留 src、href、alt
                $detail('.prose *').each((_, elem) => {
                    const $elem = $detail(elem);
                    const allowedAttrs = new Set(['src', 'href', 'alt', 'title']);
                    const attrs = Object.keys(elem.attribs || {});

                    for (const attr of attrs) {
                        if (!allowedAttrs.has(attr)) {
                            $elem.removeAttr(attr);
                        }
                    }
                });

                item.description = $detail('.prose').html();
                item.author = '旭衡电子(深圳)有限公司';
                item.category = ['公司动态', '最新资讯'];

                return item;
            });
        })
    );

    return {
        title: 'Always Control - 最新动态',
        link: listUrl,
        description: 'Always Control（旭衡电子）- 智能能源管理系统解决方案专家最新动态',
        language: 'zh-CN',
        item: items,
        image: `${baseUrl}/logo.png`,
    };
}
