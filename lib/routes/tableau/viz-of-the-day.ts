import got from '@/utils/got';
// import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    // Your logic here
    const rootUrl = 'https://public.tableau.com/api/gallery?page=0&count=20&galleryType=viz-of-the-day';
    const { data: response } = await got(rootUrl);

    const items = response.items.map((item) => ({
        title: item.title,
        link: item.sourceUrl,
        pubDate: parseDate(item.galleryItemPublicationDate),
        author: item.authorName,
        description: `<div><p>${item.description}</p><img src='${item.screenshot}'></div>`,
        itunes_item_image: item.screenshot,
    }));

    ctx.set('data', {
        // Your RSS output here
        title: 'Tableau Viz of the Day',
        link: 'https://public.tableau.com/app/discover/viz-of-the-day',
        image: 'https://help.tableau.com/current/pro/desktop/en-us/Resources/tableau-logo.png',
        item: items,
    });
};
