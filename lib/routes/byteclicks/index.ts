// @ts-nocheck
import got from '@/utils/got';
const { parseItem } = require('./utils');
const baseUrl = 'https://byteclicks.com';

export default async (ctx) => {
    const { data } = await got(`${baseUrl}/wp-json/wp/v2/posts`, {
        searchParams: {
            per_page: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 100,
        },
    });

    const items = parseItem(data);

    ctx.set('data', {
        title: '字节点击 - 聚合全球优质资源，跟踪世界前沿科技',
        description:
            'byteclicks.com 最专业的前沿科技网站。聚合全球优质资源，跟踪世界前沿科技，精选推荐一些很棒的互联网好资源好工具好产品。寻找有前景好项目、找论文、找报告、找数据、找课程、找电子书上byteclicks！byteclicks.com是投资人、科研学者、学生每天必看的网站。',
        image: 'https://byteclicks.com/wp-content/themes/RK-Blogger/images/wbolt.ico',
        link: baseUrl,
        item: items,
    });
};
