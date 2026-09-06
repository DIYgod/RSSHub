import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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
        // 分类栏目
        'zkzy', // 主考专业
        'gzzd', // 规章制度
        'sjkc', // 实践课程
        'bylw', // 毕业论文
        'xsxw', // 学士学位
        'zkby', // 自考毕业
        'zkjc', // 自考教材
        'zkzn', // 自考指南
        'lxwm', // 联系我们
        // 首页板块
        'zkzx', // 自考资讯
        'bmzn', // 报名指南
        'rcap', // 日程安排
        'xsrm', // 新生入门
        'zkmk', // 转考免考
        'fxzl', // 复习资料
    ]);
    const { category } = ctx.req.param();
    const path = categoryList.has(category) ? `${category}.htm` : 'zkzx.htm';

    const response = await ofetch(baseUrl + path);
    const $ = load(response);

    const items = $('.gg ul > li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a');
            return {
                title: a.text(),
                description: a.text(),
                link: new URL(a.attr('href')!, baseUrl).href,
                pubDate: timezone(parseDate($item.find('span').text()), 8),
            };
        });

    return {
        title: $('title').text(),
        link: baseUrl + path,
        item: items,
    };
}
