import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
// 导入必要的模组
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

const categoryMap = {
    gwxx: { title: '公务信息', tag: '20616' },
    djgz: { title: '党建工作', tag: '20617' },
    rsgz: { title: '人事工作', tag: '20622' },
    xsgz: { title: '学生工作', tag: 'xsgz' },
    kysys: { title: '科研实验室', tag: '20618' },
    bksjw: { title: '本科生教务', tag: '20619' },
    yjsjw: { title: '研究生教务', tag: '20620' },
};

export const route: Route = {
    path: '/smae/:category?',
    categories: ['university'],
    example: '/scut/smae/yjsjw',
    parameters: { category: '通知分类，默认为 `yjsjw`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '机械与汽车工程学院 - 通知公告',
    maintainers: ['Ermaotie'],
    handler,
    description: `| 公务信息 | 党建工作 | 人事工作 | 学生工作 | 科研实验室 | 本科生教务 | 研究生教务 |
| -------- | -------- | -------- | -------- | ---------- | ---------- | ---------- |
| gwxx     | djgz     | rsgz     | xsgz     | kysys      | bksjw      | yjsjw      |`,
};

async function handler(ctx) {
    const baseUrl = 'http://www2.scut.edu.cn';

    const categoryName = ctx.req.param('category') || 'yjsjw';
    const categoryMeta = categoryMap[categoryName];
    const url = `${baseUrl}/smae/${categoryMeta.tag}/list.htm`;

    const { data: response } = await got(url);
    const $ = load(response);
    const list = $('#wp_news_w6 ul li.news')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('a');
            const pubDate = $item.find('span.news_meta');
            return {
                title: a.attr('title')!,
                link: `${baseUrl}${a.attr('href')}`,
                pubDate: parseDateInTimezone(pubDate.text(), 8),
            };
        });
    const items = await pMap(
        list,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`smae:article-v3:${item.link}`, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                const content = $('div.wp_articlecontent');
                content.find('.wp_pdf_player[pdfsrc]').each((_, element) => {
                    const pdf = $(element);
                    const url = new URL(pdf.attr('pdfsrc')!, item.link).href;
                    pdf.replaceWith($('<p>').append($('<a>').attr('href', url).text('Download PDF')));
                });
                item.description = content.html();

                return { description: item.description };
            })),
        }),
        { concurrency: 3 }
    );
    return {
        title: `华南理工大学机械与汽车工程学院 - ${categoryMeta.title}`,
        link: url,
        item: items,
    };
}
