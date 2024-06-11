import { Route } from '@/types';
import { handler } from './common';

export const route: Route = {
    name: '最新相關資訊 / 最新查核報告',
    maintainers: ['TonyRL'],
    example: '/tfc-taiwan',
    path: '/:type?',
    parameters: {
        type: '分類，見下表，預設為 `report`',
    },
    handler,
    url: 'tfc-taiwan.org.tw/articles/report',
    description: `| 最新相關資訊 | 最新查核報告 |
| ------------ | ------------ |
| info         | report       |`,
};
