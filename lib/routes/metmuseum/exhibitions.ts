import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

function generateExhibitionItem(result) {
    return {
        title: result.title,
        link: `https://www.metmuseum.org${result.url}`,
        description: result.description,
        pubDate: parseDate(result.startDate),
        guid: result.id,
    };
}

export const route: Route = {
    path: '/exhibitions/:state?',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const searchType = ctx.req.param('state') ?? 'current';

    const url = `https://www.metmuseum.org/ghidorah/ExhibitionListing/Search?searchType=${searchType}`;

    const response = await got({
        url,
        method: 'GET',
    });

    const data = response.data.data;

    return {
        title: 'The Metropolitan Museum of Art - Exhibitions',
        link: 'https://www.metmuseum.org/exhibitions',
        item: data.results.map((element) => generateExhibitionItem(element)),
    };
}
