import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

function parsePublicationDate(value: string) {
    const date = parseDate(value.trim(), 'YYYY-MM-DD HH:mm:ss', true);
    return Number.isFinite(date.getTime()) ? timezone(date, 8) : undefined;
}

async function fetchDetails(url: string) {
    const response = await ofetch(url);
    const $ = load(response);
    const content = $('.v_news_content').first();
    const attachments = $('form[name="_newscontent_fromname"] a[href*="DownloadAttachUrl"]')
        .filter((_, link) => !$(link).closest('.v_news_content').length)
        .toArray()
        .map((link) => `<li>${$.html(link)}</li>`)
        .join('');

    return {
        description: `${content.html() ?? ''}${attachments ? `<ul>${attachments}</ul>` : ''}` || undefined,
    };
}

export const route: Route = {
    path: '/zkb/:category',
    categories: ['university'],
    example: '/xynu/zkb/zkzx',
    parameters: { category: '分类ID' },
    name: '高等教育自学考试办公室',
    maintainers: ['VxRain'],
    handler,
    description: `分类 ID（如果请求的分类 ID 在不存在下表中，默认请求\`zkzx\`）

| 主考专业 | 规章制度 | 实践课程 | 毕业论文 | 学士学位 | 自考毕业 | 自考教材 | 自考指南 | 联系我们 | 自考资讯 | 报名指南 | 日程安排 | 新生入门 | 转考免考 | 复习资料 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| zkzy     | gzzd     | sjkc     | bylw     | xsxw     | zkby     | zkjc     | zkzn     | lxwm     | zkzx     | bmzn     | rcap     | xsrm     | zkmk     | fxzl     |`,
};

async function handler(ctx: Context) {
    const baseUrl = 'http://zkb.xynu.edu.cn/';
    const categoryList = new Set([
        // Category navigation
        'zkzy', // Exam majors
        'gzzd', // Regulations
        'sjkc', // Practical courses
        'bylw', // Graduation thesis
        'xsxw', // Bachelor degrees
        'zkby', // Self-study graduation
        'zkjc', // Self-study textbooks
        'zkzn', // Self-study guide
        'lxwm', // Contact information
        // Homepage sections
        'zkzx', // Self-study news
        'bmzn', // Registration guide
        'rcap', // Schedule
        'xsrm', // New student guide
        'zkmk', // Transfer and exemption
        'fxzl', // Review materials
    ]);
    const { category } = ctx.req.param();
    const path = categoryList.has(category) ? `${category}.htm` : 'zkzx.htm';

    const response = await ofetch(baseUrl + path);
    const $ = load(response);

    const list = $('.gg ul > li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a');
            return {
                title: a.attr('title') || a.text(),
                link: new URL(a.attr('href')!, baseUrl).href,
                pubDate: parsePublicationDate($item.find('span').text()),
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet(item.link, () => fetchDetails(item.link));
            return { ...item, description: details.description };
        },
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: baseUrl + path,
        item: items,
    };
}
