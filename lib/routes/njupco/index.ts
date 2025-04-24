import { Route } from '@/types';
import { handler } from './handler-func';

export const route: Route = {
    path: '/news',
    categories: ['university'],
    example: '/njupco/news',
    radar: [
        {
            source: ['http://www.njupco.com/'],
        }
    ],
    name: '南京大学出版社',
    maintainers: ['ArtificialPigment'],
    handler,
};
