import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'http://www.bmie.neu.edu.cn';

const map = {
    news: 561,
    academic: 562,
    talent_development: 563,
    international_exchange: 'gjjl3',
    announcement: 564,
    undergraduate_dev: 573,
    postgraduate_dev: 574,
    undergraduate_recruit: 'bks',
    postgraduate_recruit: 574,
    CPC_build: 556,
    CPC_work: 576,
    union_work: 577,
    CYL_work: 'gqtgz',
    security_management: 569,
    alumni_style: 557,
};

export const route: Route = {
    path: '/bmie/:type',
    categories: ['university'],
    example: '/neu/bmie/news',
    parameters: { type: '分类 id 见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '医学与生物信息工程学院',
    maintainers: ['tennousuathena'],
    handler,
    description: `| Id                      | 名称       |
| ----------------------- | ---------- |
| news                    | 学院新闻   |
| academic                | 学术科研   |
| talent\_development     | 人才培养   |
| international\_exchange | 国际交流   |
| announcement            | 通知公告   |
| undergraduate\_dev      | 本科生培养 |
| postgraduate\_dev       | 研究生培养 |
| undergraduate\_recruit  | 本科生招募 |
| postgraduate\_recruit   | 研究生招募 |
| CPC\_build              | 党的建设   |
| CPC\_work               | 党委工作   |
| union\_work             | 工会工作   |
| CYL\_work               | 共青团工作 |
| security\_management    | 安全管理   |
| alumni\_style           | 校友风采   |`,
};

async function handler(ctx) {
    let type = ctx.req.param('type');
    if (map[type] !== undefined) {
        type = map[type];
    }
    const newsUrl = `${baseUrl}/${type}/list.htm`;
    const response = await got(newsUrl);

    const data = response.data;
    const $ = load(data);

    const title = $('title').text();
    const items = $('#subIndex > div.main_frame_sub > div.detail_sub > div > div > div > ul > li').slice(0, 7).toArray();
    const results = await Promise.all(
        items.map(async (item) => {
            const $ = load(item);
            const title = $('a').attr('title');
            const url = baseUrl + $('a').attr('href');
            const data = await cache.tryGet(url, async () => {
                const result = await got(url);
                const $ = load(result.data);

                const info = $($('.ny_con p')[1]).text();
                const s = info.search(/\d{4}-\d{2}-\d{2}/);
                const date = info.substring(s, s + 10);

                const au_start = info.indexOf('作者：') + 3;
                const au_end = info.lastIndexOf('|');
                const auhor = info.substring(au_start, au_end).trim();
                $('.entry')
                    .find('span')
                    .each(function () {
                        const temp = $(this).text();
                        $(this).replaceWith(temp);
                    });
                $('.entry')
                    .find('div')
                    .each(function () {
                        const temp = $(this).html();
                        $(this).replaceWith(temp);
                    });
                $('.entry').find('a').remove();
                $('.entry')
                    .find('p')
                    .each(function () {
                        $(this).removeAttr('style');
                        $(this).removeAttr('class');
                    });
                $('.wp_art_adjoin').remove();
                return { description: $('.entry').html(), date, author: auhor };
            });
            const description = data.description;
            const pubDate = parseDate(data.date);
            const author = data.author;
            const result = {
                title,
                description,
                link: url,
                pubDate,
                author,
            };
            return result;
        })
    );
    return {
        title: `东北大学 医学与生物信息工程学院 ${title}`,
        link: newsUrl,
        item: results,
    };
}
