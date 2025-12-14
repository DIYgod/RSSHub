import type { Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/featured/:category?',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/techflowpost/featured',
    parameters: {
        category: '分类，见下表，默认为全部',
    },
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
            source: ['techflowpost.com/article/index.html'],
        },
    ],
    name: '精选',
    maintainers: ['zhenlohuang'],
    handler,
    url: 'techflowpost.com/article/index.html',
    description: `| 全部 | 行业 & 项目观察 | 项目简介 | 项目动态 | 赛道解读 | 播客笔记 | 交易观察 | VC洞察 | 实用教程 | 人物故事 & 访谈 | 法律 & 监管动态 | 活动动态 | 交易所动态 |
  | ---- | --------------- | -------- | -------- | -------- | -------- | -------- | ------ | -------- | --------------- | --------------- | -------- | ---------- |
  |      | 1               | 2        | 3        | 4        | 5        | 6        | 7      | 8        | 9               | 10              | 11       | 12         |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';
    const limit = ctx.req.query('limit') ?? 50;

    const rootUrl = 'https://www.techflowpost.com';
    const currentUrl = `${rootUrl}/article/index.html`;

    const formData: Record<string, string | number> = {
        pageindex: 1,
        pagesize: limit,
    };

    if (category) {
        formData.cata_id = category;
    }

    const { data: response } = await got.post('https://www.techflowpost.com/ashx/index.ashx', {
        form: formData,
    });

    const items = response.content.map((item) => ({
        title: item.stitle,
        author: item.sauthor_name,
        link: `${rootUrl}/article/detail_${item.narticle_id}.html`,
        category: [item.new_scata_name],
        pubDate: timezone(parseDate(item.dcreate_time), +8),
        updated: timezone(parseDate(item.dmodi_time), +8),
        description: item.scontent,
    }));

    return {
        title: '深潮TechFlow - 精选文章',
        link: currentUrl,
        item: items,
    };
}
