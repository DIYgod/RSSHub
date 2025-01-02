import { Route } from '@/types';
import { handler } from './common';

export const route: Route = {
    name: '專題 / 重點專區',
    maintainers: ['TonyRL'],
    example: '/tfc-taiwan/category/242',
    path: '/:type/:id{.+}',
    parameters: {
        type: '分類，見下表，預設為 `report`',
    },
    handler,
    url: 'tfc-taiwan.org.tw/articles/report',
    description: `| 專題     | 重點專區 |
| -------- | -------- |
| category | topic    |`,
};
