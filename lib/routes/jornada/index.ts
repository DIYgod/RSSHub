import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.jornada.com.mx';

const categories = {
    capital: 'Capital',
    cartones: 'Cartones',
    ciencia: 'Ciencia-Y-Tecnologia',
    cultura: 'Cultura',
    deportes: 'Deportes',
    economia: 'Economia',
    estados: 'Estados',
    mundo: 'Mundo',
    opinion: 'Opinion',
    politica: 'Politica',
    sociedad: 'Sociedad',
};

const getDateForToday = () => {
    const date = new Date(Date.now());
    const today = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
    return today;
};

export const route: Route = {
    path: '/:date?/:category?',
    categories: ['traditional-media'],
    example: '/jornada/2022-10-12/capital',
    parameters: { date: "Date string, must be in format of `YYYY-MM-DD`. You can get today's news using `today`", category: 'Category, refer to the table below' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'News',
    maintainers: ['Thealf154'],
    handler,
    description: `Provides a way to get an specific rss feed by date and category over the official one.

| Category             | \`:category\` |
| -------------------- | ----------- |
| Capital              | capital     |
| Cartones             | cartones    |
| Ciencia y Tecnología | ciencia     |
| Cultura              | cultura     |
| Deportes             | deportes    |
| Economía             | economia    |
| Estados              | estados     |
| Mundo                | mundo       |
| Opinión              | opinion     |
| Política             | politica    |
| Sociedad             | sociedad    |`,
};

async function handler(ctx) {
    const date = ctx.req.param('date') === 'today' || ctx.req.param('date') === undefined ? getDateForToday() : ctx.req.param('date');
    const category = ctx.req.param('category');
    const url = `${rootUrl}/jsonstorage/articles_${date}_.json`;

    const response = await got(url);
    const data = response.data;

    let items = {};

    if (category) {
        const newsFilteredByCategory = data.filter((item) => item.category === categories[category]);

        items = newsFilteredByCategory.map((item) => ({
            title: item.title,
            description: item.content,
            pubDate: parseDate(item.date),
            link: `${rootUrl}/${item.url}`,
        }));
    } else {
        items = data.map((item) => ({
            title: item.title,
            description: item.content,
            pubDate: parseDate(item.date),
            link: `${rootUrl}/${item.url}`,
        }));
    }

    return {
        title: 'La Jornada',
        link: rootUrl,
        item: items,
    };
}
