import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/columnist/articleList/:id?',
    categories: ['new-media'],
    example: '/logclub/columnist/articleList/27',
    parameters: { id: '专家 id，见下表，可在对应企业页 URL 中找到' },
    radar: [
        {
            source: ['logclub.com/columnist/articleList/:id'],
            target: '/columnist/articleList/:id',
        },
    ],
    name: '专家说',
    maintainers: ['nczitzk'],
    handler,
    description: `#### 精选专家

| 潘永刚 | Tracy | 唐隆基 | 褚建新 |
| ------ | ----- | ------ | ------ |
| 27     | 157   | 91     | 9749   |

前往 [更多](https://www.logclub.com/columnist/authorMore/experts) 查看更多专家

#### 资深作者

| 物流麻将胡 | 小周伯通 | 郭嘉 | 周艳青 |
| ---------- | -------- | ---- | ------ |
| 10         | 19       | 7    | 559    |

前往 [更多](https://www.logclub.com/columnist/authorMore/author) 查看更多专家

#### 综合物流

| 韩雪峰 | 李赛赛 | 陈晓曦 | 李长宏 |
| ------ | ------ | ------ | ------ |
| 41     | 12378  | 1495   | 110    |

前往 [更多](https://www.logclub.com/columnist/authorMore/integrated_logistics) 查看更多专家

#### 数字化

| 秦愉 | 冯雷 | 卢立新 | 段琰 |
| ---- | ---- | ------ | ---- |
| 160  | 147  | 95     | 284  |

前往 [更多](https://www.logclub.com/columnist/authorMore/digitization) 查看更多专家

#### 智能化

| 曾志宏 | 亦橙 | 马荣 | 陈晓春 |
| ------ | ---- | ---- | ------ |
| 34     | 201  | 130  | 123    |

前往 [更多](https://www.logclub.com/columnist/authorMore/intellectualization) 查看更多专家

#### 快运

| 王坚 | 王拥军 | 靖晟 | 廖文明 |
| ---- | ------ | ---- | ------ |
| 172  | 252    | 84   | 50     |

前往 [更多](https://www.logclub.com/columnist/authorMore/express_transportation) 查看更多专家

#### 合同物流

| 非红 | 王鹏飞 | 周海 | 王伟 |
| ---- | ------ | ---- | ---- |
| 40   | 2274   | 168  | 158  |

前往 [更多](https://www.logclub.com/columnist/authorMore/contract_logistics) 查看更多专家

#### 供应链

| 黄尧笛 | 卓弘毅 | 胡珉 | 雷文军 Jason |
| ------ | ------ | ---- | ------------ |
| 26     | 35     | 188  | 303          |

前往 [更多](https://www.logclub.com/columnist/authorMore/supply_chain) 查看更多专家

#### 快递

| 致快递 | 中通之声 | 科技中通 | 明兴 |
| ------ | -------- | -------- | ---- |
| 9633   | 618      | 385      | 265  |

前往 [更多](https://www.logclub.com/columnist/authorMore/express) 查看更多专家

#### 城配

| 张春鑫 (荡漾哥) | 梁佳 | 赵波 | 王行广 |
| --------------- | ---- | ---- | ------ |
| 1527            | 3374 | 49   | 75     |

前往 [更多](https://www.logclub.com/columnist/authorMore/urban_distribution) 查看更多专家

#### 仓储

| 叶剑 | 木棉 | 陈艺 | 冯银川 |
| ---- | ---- | ---- | ------ |
| 1881 | 59   | 1637 | 215    |

前往 [更多](https://www.logclub.com/columnist/authorMore/storage) 查看更多专家`,
};
