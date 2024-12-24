import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import iconv from 'iconv-lite';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const gbk2utf8 = (s) => iconv.decode(s, 'gbk');
export const route: Route = {
    path: '/jsjxy',
    categories: ['university'],
    example: '/stbu/jsjxy',
    parameters: {},
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
            source: ['jsjxy.stbu.edu.cn/news', 'jsjxy.stbu.edu.cn'],
        },
        {
            source: ['stbu.edu.cn'],
        },
    ],
    name: '计算机学院 - 通知公告',
    maintainers: ['HyperCherry'],
    handler,
    url: 'jsjxy.stbu.edu.cn/news',
    description: `:::warning
计算机学院通知公告疑似禁止了非大陆 IP 访问，使用路由需要自行 [部署](https://docs.rsshub.app/deploy/)。
:::`,
};

async function handler() {
    const baseUrl = 'https://jsjxy.stbu.edu.cn/news/';
    const { data: response } = await got(baseUrl, {
        responseType: 'buffer',
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = load(gbk2utf8(response));
    const list = $('.content dl h4')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.text(),
                link: a.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link, {
                    responseType: 'buffer',
                    https: {
                        rejectUnauthorized: false,
                    },
                });
                const $ = load(gbk2utf8(response));
                item.description = $('.content14').first().html().trim();
                item.pubDate = timezone(parseDate($('.article .source').text().split('日期：')[1].replace('\n', '').trim()), +8);
                return item;
            })
        )
    );

    return {
        title: '四川工商学院计算机学院 - 新闻动态',
        link: baseUrl,
        description: '四川工商学院计算机学院 - 新闻动态',
        item: items,
    };
}
