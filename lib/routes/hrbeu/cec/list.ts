import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const rootUrl = 'http://cec.hrbeu.edu.cn';

export const route: Route = {
    path: '/cec/:id',
    categories: ['university'],
    example: '/hrbeu/cec/tzgg',
    parameters: { id: '栏目编号，由 `URL` 中获取。' },
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
            source: ['cec.hrbeu.edu.cn/:id/list.htm'],
        },
    ],
    name: '航天与建筑工程学院',
    maintainers: ['tsinglinrain'],
    handler,
    description: `汉语拼音和中文不对应，猜测后三个为：教务工作、科研成果、学生工作的拼音。

| 新闻动态 | 通知公告 | 综合办公 | 教务动态 | 科研动态 | 学工动态 |
| :------: | :------: |:------: | :------: | :------: | :------: |
|   xwdt   |   tzgg   |  zhbg   |   jxgz   |   kycg   |   xsgz   |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const response = await got(`${rootUrl}/${id}/list.htm`, {
        headers: {
            Referer: rootUrl,
        },
    });

    const $ = load(response.data);

    const bigTitle = $('div.column-news-box').find('h2.column-title').text().replaceAll(/[\s·]/g, '').trim();

    const list = $('a.column-news-item')
        .toArray()
        .map((item) => {
            let link = $(item).attr('href');
            if (link && link.includes('page.htm')) {
                link = `${rootUrl}${link}`;
            }
            return {
                title: $(item).find('span.column-news-title').text().trim(),
                pubDate: parseDate($(item).find('span.column-news-date').text()),
                link,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (item.link.includes('page.htm')) {
                    const detailResponse = await got(item.link);
                    const content = load(detailResponse.data);
                    item.description = content('div.wp_articlecontent').html();
                } else {
                    item.description = '本文需跳转，请点击标题后阅读';
                }
                return item;
            })
        )
    );

    return {
        title: '航天与建筑工程学院 - ' + bigTitle,
        link: `${rootUrl}/${id}/list.htm`,
        item: items,
    };
}
