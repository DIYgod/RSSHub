const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

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

module.exports = async (ctx) => {
    const date = ctx.params.date === 'today' || ctx.params.date === undefined ? getDateForToday() : ctx.params.date;
    const category = ctx.params.category;
    const url = `${rootUrl}/jsonstorage/articles_${date}_.json`;

    const response = await got(url);
    const data = response.data;

    let items = {};

    if (!category) {
        items = data.map((item) => ({
            title: item.title,
            description: item.content,
            pubDate: parseDate(item.date),
            link: `${rootUrl}/${item.url}`,
        }));
    } else {
        const newsFilteredByCategory = data.filter((item) => item.category === categories[category]);

        items = newsFilteredByCategory.map((item) => ({
            title: item.title,
            description: item.content,
            pubDate: parseDate(item.date),
            link: `${rootUrl}/${item.url}`,
        }));
    }

    ctx.state.data = {
        title: 'La Jornada',
        link: rootUrl,
        item: items,
    };
};
