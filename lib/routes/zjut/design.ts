import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'http://www.design.zjut.edu.cn';
const decoder = new TextDecoder('gbk');

export const route: Route = {
    path: '/design/:type',
    categories: ['university'],
    example: '/zjut/design/16',
    parameters: { type: '板块id' },
    name: '设计与建筑学院',
    maintainers: ['yikZero'],
    handler,
    description: `| 学院新闻 | 公告通知 | 学术交流 |
| -------- | -------- | -------- |
| 16       | 18       | 20       |`,
};

async function handler(ctx: Context) {
    const { type } = ctx.req.param();
    const link = `${host}/BigClass.jsp?bigclassid=${type}`;

    const response = await ofetch(link, { responseType: 'arrayBuffer' });
    const $ = load(decoder.decode(response));

    const htmlTitle = $("span[class='title1']").text().replace('\n', '').trim();

    const list = $("td[class='newstd']")
        .toArray()
        .slice(0, 20)
        .map((item) => {
            const $item = $(item);
            const itemLink = $item.find('a').attr('href')!;
            const date = $item.find("span[class='datetime']").text().replace('[', '').replace(']', '');

            return {
                title: $item.find('a').text(),
                link: itemLink.startsWith('http') ? itemLink : `${host}/${itemLink}`,
                pubDate: timezone(parseDate(date), 8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const itemResponse = await ofetch(item.link);
                const $item = load(itemResponse);

                return {
                    ...item,
                    description: $item('div[style="line-height:27px;"]').html(),
                };
            })
        )
    );

    return {
        title: `浙江工业大学设计与建筑学院 - ${htmlTitle}`,
        link,
        item: items,
    };
}
