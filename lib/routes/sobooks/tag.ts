import { Route } from '@/types';
import utils from './utils';

export const route: Route = {
    path: '/tag/:id?',
    categories: ['reading'],
    example: '/sobooks/tag/小说',
    parameters: { id: '标签, 见下表，默认为小说' },
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
            source: ['sobooks.net/books/tag/:tag'],
            target: '/tag/:tag',
        },
    ],
    name: '标签',
    maintainers: ['nczitzk'],
    handler,
    description: `热门标签

  | 小说 | 文学 | 历史 | 日本 | 科普 | 管理 | 推理 | 社会 | 经济   |
  | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ------ |
  | 传记 | 美国 | 悬疑 | 哲学 | 心理 | 商业 | 金融 | 思维 | 经典   |
  | 随笔 | 投资 | 文化 | 励志 | 科幻 | 成长 | 中国 | 英国 | 政治   |
  | 漫画 | 纪实 | 艺术 | 科学 | 生活 | 职场 | 散文 | 法国 | 互联网 |
  | 营销 | 奇幻 | 二战 | 股票 | 女性 | 德国 | 学习 | 战争 | 创业   |
  | 绘本 | 名著 | 爱情 | 军事 | 理财 | 教育 | 世界 | 人物 | 沟通   |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '小说';

    return await utils(ctx, `books/tag/${id}`);
}
