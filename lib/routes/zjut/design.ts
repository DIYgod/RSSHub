import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'http://www.design.zjut.edu.cn';

export const route: Route = {
    path: '/design/:type',
    categories: ['university'],
    example: '/zjut/design/16',
    parameters: { type: '栏目 id，可在栏目页 URL `#/category?id=` 中找到' },
    name: '设计与建筑学院',
    maintainers: ['yikZero'],
    handler,
    url: 'www.design.zjut.edu.cn',
    description: `#### 新闻公告

| 学院新闻 | 公告通知 | 学术交流 | 文件下载 |
| -------- | -------- | -------- | -------- |
| 16       | 18       | 20       | 21       |

#### 党建工作

| 通知公告 | 堡垒先锋 | 党建动态 | 表格下载 |
| -------- | -------- | -------- | -------- |
| 104      | 100      | 106      | 109      |

#### 科学研究

| 科研申报 | 科研成果 | 文件与资源 |
| -------- | -------- | ---------- |
| 25       | 26       | 27         |

#### 本科生培养

| 文件与下载 | 本科生公告          |
| ---------- | ------------------- |
| 23         | 1902960923368505344 |

#### 研究生培养

| 研究生公告 | 文件与下载 | 研究生招生 | 导师风采 |
| ---------- | ---------- | ---------- | -------- |
| 28         | 29         | 31         | 45       |

#### 学生工作

| 学工新闻 | 竞赛创新 | 学工通知 | 榜样风采 | 文件下载 |
| -------- | -------- | -------- | -------- | -------- |
| 213      | 202      | 218      | 216      | 292      |

#### 两学一做

| 新闻动态 | 通知公告 | 学习资料 | 工作简报 | 信息报送排行 | 相关文件 |
| -------- | -------- | -------- | -------- | ------------ | -------- |
| 32       | 33       | 34       | 35       | 36           | 37       |

#### 实验室安全

| 新闻通知 | 规章制度 |
| -------- | -------- |
| 122      | 123      |`,
};

async function handler(ctx: Context) {
    const { type } = ctx.req.param();

    const { data } = await ofetch(`${host}/jsp/api/an/column`, { query: { id: type } });

    const list = data.pages.list.map((item) => ({
        title: item.title,
        link: item.url || `${host}/#/detail/${item.id}`,
        pubDate: timezone(parseDate(item.date), 8),
        description: item.content,
        id: item.id,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (!item.link.startsWith(`${host}/#/detail/`)) {
                    return item;
                }
                const { data } = await ofetch(`${host}/jsp/api/an/news`, { query: { id: item.id } });
                item.description = data.content;
                return item;
            })
        )
    );

    return {
        title: `浙江工业大学设计与建筑学院 - ${data.name}`,
        link: `${host}/#/category?id=${type}`,
        item: items,
    };
}
