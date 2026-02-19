import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/index/:category?',
    categories: ['university'],
    example: '/xaut/index/tzgg',
    parameters: { category: '通知类别，默认为学校新闻' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '学校主页',
    maintainers: ['mocusez'],
    handler,
    description: `| 学校新闻 | 砥志研思 | 立德树人 | 传道授业 | 校闻周知 |
| :------: | :------: | :------: | :------: | :------: |
|   xxxw   |   dzys   |   ldsr   |   cdsy   |   xwzz   |`,
};

async function handler(ctx) {
    let category = ctx.req.param('category');
    const dic_html = { xxxw: 'xxxw.htm', dzys: 'dzys.htm', ldsr: 'ldsr.htm', cdsy: 'cdsy.htm', xwzz: 'xwzz.htm' };
    const dic_title = { xxxw: '学校新闻', dzys: '砥志研思', ldsr: '立德树人', cdsy: '传道授业', xwzz: '校闻周知' };

    // 设置默认值
    if (dic_title[category] === undefined) {
        category = 'xxxw';
    }

    const response = await got({
        method: 'get',
        url: 'http://www.xaut.edu.cn/index/' + dic_html[category],
    });
    const data = response.body;
    const $ = load(data);

    const list = $('div.nlist ul li')
        .toArray()
        .map((item) => {
            item = $(item);
            // link原来长这样：'../info/1196/13990.htm'
            const link = item.find('a').attr('href').replace(/^\.\./, 'http://www.xaut.edu.cn');
            const pubDate = timezone(parseDate(item.find('div.time').text().trim()), +8);
            const title = item.find('h5').text();

            return {
                title,
                link,
                pubDate,
            };
        });

    return {
        // 源标题
        title: '西安理工大学官网-' + dic_title[category],
        // 源链接
        link: 'http://www.xaut.edu.cn',
        // 源说明
        description: `西安理工大学官网-` + dic_title[category],
        // 遍历此前获取的数据
        item: await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    if (!item.link.includes('://zhixing.xaut.edu.cn/') && !item.link.includes('://xinwen.xaut.edu.cn/')) {
                        const res = await got({
                            method: 'get',
                            url: item.link,
                        });
                        const content = load(res.body);
                        item.description = content('#vsb_content').html();
                    } else {
                        item.description = '请在校内或校园VPN内查看内容';
                    }
                    return item;
                })
            )
        ),
    };
}
