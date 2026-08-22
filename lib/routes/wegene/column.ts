import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/column/:type/:category',
    categories: ['other'],
    example: '/wegene/column/all/all',
    parameters: { type: '栏目类型，all（全部项目） 或 weapp（专业版）', category: '栏目分类' },
    radar: [{ source: ['www.wegene.com/crowdsourcing'], target: '/column/all/all' }],
    name: '微解读栏目',
    maintainers: ['LogicJake'],
    handler,
    description: `::: tip
type 为 all 时，category 参数不支持 cost 和 free
:::

| 全部 | 祖源分析 | 付费 | 遗传性疾病 | 药物指南 | 免费 | 运动基因 | 营养代谢   | 心理特质   | 健康风险 | 皮肤特性 | 遗传特征 |
| ---- | -------- | ---- | ---------- | -------- | ---- | -------- | ---------- | ---------- | -------- | -------- | -------- |
| all  | ancestry | cost | disease    | drug     | free | genefit  | metabolism | psychology | risk     | skin     | traits   |`,
};

async function handler(ctx: Context) {
    const { type, category } = ctx.req.param();
    const name = type === 'all' ? '全部项目' : '专业版';

    const link = 'https://www.wegene.com/crowdsourcing';
    const api = `https://www.wegene.com/crowdsourcing/ajax/get_list/?&htmlspecialchars_decode=true&type=${type}&page=1&limit=10&category=${category}&sort=NEW`;

    const response = await ofetch(api, { responseType: 'json' });
    const data = response.rsm.list;

    return {
        title: `${name}的${category}最近更新-WeGene`,
        link,
        item: data.map((item) => ({
            title: item.title,
            link: `https://www.wegene.com/crowdsourcing/details/${item.id}`,
            pubDate: parseDate(item.add_time, 'X'),
            author: item.user.user_name,
            description: item.description,
        })),
    };
}
