import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import * as cheerio from 'cheerio';

export const route: Route = {
    path: '/mobile',
    categories: ['new-media', 'popular'],
    example: '/sohu/mobile',
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
            source: ['m.sohu.com/limit'],
            target: '/mobile',
        },
    ],
    name: '首页新闻',
    maintainers: ['asqwe1'],
    handler,
    description: '订阅手机搜狐网的首页新闻',
};

async function handler() {
    try {
        const response = await ofetch('https://m.sohu.com/limit', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'
            }
        });
        const $ = cheerio.load(response);
        const list = $('.content-left  section > div.f').toArray()
            .map((item) => {
                item = $(item);
                const a = item.find('a').first();
                let link = a.attr('href') || '';
                if (link && !link.startsWith('http')) {
                    link = new URL(link, 'https://m.sohu.com').href;
                }
                return {
                    title: a.text().trim(),
                    link
                };
            })
            .filter((item) => item.link); // 过滤无效链接

        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    try {
                        const detailResp = await ofetch(item.link);
                        const $d = cheerio.load(detailResp);
                        item.description = $d('#articleContent').first().html();
                        return item;
                    } catch (error) {
                        return item; // 返回基础信息
                    }
                })
            )
        );
        return {
            title: '手机搜狐新闻',
            link: 'https://m.sohu.com/limit',
            item: items.filter(Boolean), // 过滤空项
        };
    } catch (error) {
        return {
            title: '手机搜狐新闻',
            link: 'https://m.sohu.com/limit',
            item: [],
        };
    }
}
