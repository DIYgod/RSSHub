import { Route } from '@/types';
import { getData, getList } from './utils';

export const route: Route = {
    path: '/',
    categories: ['programming'],
    radar: [
        {
            source: ['alistapart.com/articles/'],
            target: '/',
        },
    ],
    name: 'Home Feed',
    maintainers: ['Rjnishant530'],
    handler,
    url: 'alistapart.com/articles/',
    example: '/alistapart',
};

async function handler() {
    const baseUrl = 'https://alistapart.com';
    const route = '/wp-json/wp/v2/article?_embed';

    const data = await getData(`${baseUrl}${route}`);
    const items = await getList(data);

    return {
        title: 'A List Apart',
        link: `${baseUrl}/articles`,
        item: items,
        description: 'Articles on aListApart.com',
        logo: 'https://i0.wp.com/alistapart.com/wp-content/uploads/2019/03/cropped-icon_navigation-laurel-512.jpg?fit=192,192&ssl=1',
        icon: 'https://i0.wp.com/alistapart.com/wp-content/uploads/2019/03/cropped-icon_navigation-laurel-512.jpg?fit=32,32&ssl=1',
        language: 'en-us',
    };
}
