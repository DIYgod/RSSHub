import got from '@/utils/got';
import cheerio from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async function darioamodeiHandler(ctx) {
    const rootUrl = 'https://darioamodei.com';
    
    const response = await got(rootUrl);
    const $ = cheerio.load(response.data);

    const items = $('.essay')
        .map((_, essay) => {
            const $essay = $(essay);
            const $title = $essay.find('h3');
            const $link = $essay.find('a').first();
            const dateStr = $essay.find('span').first().text().trim();
            
            const articleUrl = new URL($link.attr('href'), rootUrl).href;
            
            return {
                title: $title.text().trim(),
                link: articleUrl,
                description: $essay.find('p').text().trim(),
                pubDate: parseDate(dateStr, 'MMMM YYYY'),
            };
        })
        .get();

    ctx.state.data = {
        title: 'Dario Amodei - Essays',
        link: rootUrl,
        item: items,
        description: 'Essays from Dario Amodei\'s personal website',
    };
}
