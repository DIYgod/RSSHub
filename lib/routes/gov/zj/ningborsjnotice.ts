import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

export const route: Route = {
    path: '/ningborsjnotice/:colId?',
    categories: ['government'],
    example: '/gov/zj/ningborsjnotice/1229676740',
    parameters: {
        colId: '公告分类id、详细信息点击源网站http://rsj.ningbo.gov.cn/请求中寻找',
    },
    radar: [
        {
            source: ['rsj.ningbo.gov.cn/col/col1229676740/index.html'],
            target: '/ningborsjnotice/:colId?',
        },
    ],
    name: '宁波市人力资源和社会保障局-公告',
    url: 'rsj.ningbo.gov.cn',
    maintainers: ['HaoyuLee'],
    description: `| 公告类别         | colId      |
| ---------------- | ---------- |
| 事业单位进人公告 | 1229676740 |`,
    async handler(ctx) {
        const { colId = '1229676740' } = ctx.req.param();
        const url = `http://rsj.ningbo.gov.cn/col/col${colId}/index.html`;
        const { data: response } = await got(url);
        const noticeCate = load(response)('.titel.bgcolor01').text();
        const reg = /<li class="news_line">.*<\/li>/g;
        const item = (response.match(reg) ?? []).map((line) => {
            const $ = load(line);
            const title = $('.news_titel');
            const href = title.attr('href');
            const date = $('.news_date').text().replaceAll(/\[|\]/g, '').trim();
            return {
                title: `宁波人社公告-${noticeCate}:${title.text()}`,
                link: href ? new URL(href, url).href : undefined,
                pubDate: date ? parseDateInTimezone(date, 8) : undefined,
                author: '宁波市人力资源和社会保障局',
            };
        });
        return {
            title: '宁波市人力资源和社会保障局-公告',
            link: url,
            item,
        };
    },
};
