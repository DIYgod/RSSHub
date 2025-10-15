import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/ygafz/:type?',
    categories: ['university'],
    example: '/sysu/ygafz',
    parameters: { type: '分类，见下表，默认为 `notice`' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['ygafz.sysu.edu.cn/:type?'],
        },
    ],
    name: '粤港澳发展研究院',
    description: `| 人才招聘   | 人才培养      | 新闻动态 | 通知公告 | 专家观点 |
| ---------- | ------------- | -------- | -------- | -------- |
| jobopening | personnelplan | news     | notice   | opinion  |

| 研究成果 | 研究论文 | 学术著作 | 形势政策 |
| -------- | -------- | -------- | -------- |
| results  | papers   | writings | policy   |`,
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { type = 'notice' } = ctx.req.param();
    const baseUrl = 'https://ygafz.sysu.edu.cn';
    const url = `${baseUrl}/${type}`;

    const response = await ofetch(url);
    const $ = load(response);

    const list = $('.list-content a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('p').text(),
                link: `${baseUrl}${item.attr('href')}`,
                pubDate: parseDate(item.find('.date').text()), // 2023-03-22
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const data = await ofetch(item.link);
                const $ = load(data);

                item.author = $('.article-submit')
                    .text()
                    .match(/发布人：(.*)/)[1];
                item.description = $('div[data-block-plugin-id="entity_field:node:body"]').html() + ($('div[data-block-plugin-id="entity_field:node:attachments"]').html() ?? '');
                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: url,
        item: items,
    };
}
