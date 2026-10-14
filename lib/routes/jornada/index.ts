import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
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

const getDateForToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).format(Date.now());

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
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`)) || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
        throw new InvalidParameterError('Date must be a valid YYYY-MM-DD calendar date or today.');
    }
    if (category && !Object.hasOwn(categories, category)) {
        throw new InvalidParameterError('Unsupported news category. Use a category from the route description.');
    }
    const url = `${rootUrl}/jsonstorage/articles_${date}_.json`;

    const response = await got(url);
    const data = response.data;

    let items: DataItem[];

    if (category) {
        const newsFilteredByCategory = data.filter((item) => item.category === categories[category]);

        items = newsFilteredByCategory.map((item) => ({
            title: item.title,
            description: item.content,
            pubDate: item.date ? parseDate(item.date) : undefined,
            link: new URL(item.url, `${rootUrl}/`).href,
        }));
    } else {
        items = data.map((item) => ({
            title: item.title,
            description: item.content,
            pubDate: item.date ? parseDate(item.date) : undefined,
            link: new URL(item.url, `${rootUrl}/`).href,
        }));
    }

    return {
        title: 'La Jornada',
        link: rootUrl,
        item: items,
    };
}
