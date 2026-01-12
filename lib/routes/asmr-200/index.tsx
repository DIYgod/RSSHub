import { renderToString } from 'hono/jsx/dom/server';

import type { Result, Work } from '@/routes/asmr-200/type';
import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const render = (work: Work, link: string) =>
    renderToString(
        <>
            <a href={link} title="点击进入官网查看">
                <img src={work.mainCoverUrl} alt={work.title} />
            </a>
            <h1>
                {work.title} <span style="font-size: 0.6em; color: darkred;">{work.source_id}</span>
            </h1>
            <p>
                <b>发布者：</b>
                {work.name}
            </p>
            <p>
                <b>评分：</b>
                {work.rate_average_2dp} | <b>评论数：</b>
                {work.review_count} | <b>总时长：</b>
                {work.duration} | <b>音频来源：</b>
                {work.source_type}
            </p>
            <p>
                <b>价格：</b>
                <span style="color: #f44336">{work.price} JPY</span> | <b>销量：</b>
                {work.dl_count}
            </p>
            <p>
                <b>分类：</b>
                {work.category}
            </p>
            <p>
                <b>声优：</b>
                {work.cv}
            </p>
        </>
    );

export const route: Route = {
    path: '/works/:order?/:subtitle?/:sort?',
    categories: ['multimedia'],
    example: '/asmr-200/works',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    parameters: {
        order: '排序字段，默认按照资源的收录日期来排序，详见下表',
        sort: '排序方式，可选 `asc` 和 `desc` ，默认倒序',
        subtitle: '筛选带字幕音频，可选 `0` 和 `1` ，默认关闭',
    },
    radar: [
        {
            source: ['asmr-200.com'],
            target: 'asmr-200/works',
        },
    ],
    name: '最新收录',
    maintainers: ['hualiong'],
    url: 'asmr-200.com',
    description: `| 发售日期 | 收录日期 | 销量 | 价格 | 评价 | 随机 | RJ号 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| release | create_date | dl_count | price | rate_average_2dp | random | id |`,
    handler: async (ctx) => {
        const { order = 'create_date', sort = 'desc', subtitle = '0' } = ctx.req.param();
        const res = await ofetch<Result>('https://api.asmr-200.com/api/works', { query: { order, sort, page: 1, subtitle } });

        const items: DataItem[] = res.works.map((each) => {
            const category = each.tags.map((tag) => tag.name);
            each.category = category.join('，');
            each.cv = each.vas.map((cv) => cv.name).join('，');
            return {
                title: each.title,
                image: each.mainCoverUrl,
                author: each.name,
                link: `https://asmr-200.com/work/${each.source_id}`,
                pubDate: timezone(parseDate(each.release, 'YYYY-MM-DD'), +8),
                category,
                description: render(each, `https://asmr-200.com/work/${each.source_id}`),
            };
        });

        return {
            title: '最新收录 - ASMR Online',
            link: 'https://asmr-200.com/',
            item: items,
        };
    },
};
