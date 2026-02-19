import { load } from 'cheerio';
import { CookieJar } from 'tough-cookie';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const cookieJar = new CookieJar();
const baseUrl = 'https://www.chinathinktanks.org.cn';

export const route: Route = {
    path: '/:id',
    categories: ['study'],
    example: '/chinathinktanks/57',
    parameters: { id: '见下表，亦可在网站 url 里找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '观点与实践',
    maintainers: ['Aeliu'],
    handler,
    description: `| \`:id\` | 专题名称 |
| ----- | -------- |
| 2     | 党的建设 |
| 3     | 社会     |
| 4     | 生态     |
| 5     | 政治     |
| 6     | 经济     |
| 7     | 文化     |
| 9     | 热点专题 |
| 10    | 国际关系 |
| 13    | 国外智库 |
| 46    | 智库报告 |
| 57    | 智库要闻 |
| 126   | 世界经济 |
| 127   | 宏观经济 |
| 128   | 区域经济 |
| 129   | 产业企业 |
| 130   | 三农问题 |
| 131   | 财政金融 |
| 132   | 科技创新 |
| 133   | 民主     |
| 134   | 法治     |
| 135   | 行政     |
| 136   | 国家治理 |
| 137   | 社会事业 |
| 138   | 社会保障 |
| 139   | 民族宗教 |
| 140   | 人口就业 |
| 141   | 社会治理 |
| 142   | 文化产业 |
| 143   | 公共文化 |
| 144   | 文化体制 |
| 145   | 文化思想 |
| 146   | 资源     |
| 147   | 能源     |
| 148   | 环境     |
| 149   | 生态文明 |
| 150   | 思想建设 |
| 151   | 作风建设 |
| 152   | 组织建设 |
| 153   | 制度建设 |
| 154   | 反腐倡廉 |
| 155   | 中国外交 |
| 156   | 全球治理 |
| 157   | 大国关系 |
| 158   | 地区政治 |
| 181   | 执政能力 |`,
};

async function handler(ctx) {
    const link = `https://www.chinathinktanks.org.cn/content/list?id=${ctx.req.param('id')}&pt=1`;

    const response = await got(link, {
        cookieJar,
    });
    const $ = load(response.data);

    let items = $('.main-content-left-list-item')
        .toArray()
        .map((e) => {
            e = $(e);
            return {
                title: e.find('.title span').text(),
                link: baseUrl + e.attr('href'),
                author: e.find('.author-by span').text(),
                pubDate: e.find('.author-time').text(),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got({
                    url: item.link,
                    cookieJar,
                });
                const $ = load(response.data);
                const content = $('#art');
                item.description = content.html();
                item.pubDate = item.pubDate.includes('-') ? timezone(parseDate(item.pubDate, 'YYYY-MM-DD'), +8) : parseRelativeDate(item.pubDate);

                return item;
            })
        )
    );

    return {
        title: `中国智库网 —— ${$('title').text().split('_中国智库网')[0]}`,
        link,
        item: items,
    };
}
