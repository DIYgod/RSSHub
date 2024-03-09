// Require necessary modules
import got from '@/utils/got'; // a customised got
import { load } from 'cheerio'; // an HTML parser with a jQuery-like API
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const baseUrl = 'https://hackyournews.com';
    const { data: response } = await got(baseUrl);
    const $ = load(response);

    const item = $('tr.story')
        .map((_, story) => {
            const title = $(story).find('a').first().text();
            const nextRow = $(story).next();
            const metas = nextRow.text().trimStart().split('|');
            const upvotes = Number.parseInt(metas[0].split(' points')[0].trim());
            const author = metas[0].split('by')[1].trim();
            const pubDate = parseDate(metas[1].trim());
            let category = [];
            // NOTE: If the summary is not already proceeded, we cannot get the category.
            if (metas.length === 5) {
                category = [metas[2].trim(), metas[3].trim()];
            }
            const a = nextRow.find('a');
            const link = a.attr('href');
            const comments = Number.parseInt(a.text());
            const description = nextRow
                .find('p')
                .map((_, p) => $(p).text())
                .get()
                .join('<br>');
            return {
                title,
                link,
                author,
                category,
                comments,
                upvotes,
                pubDate,
                description,
            };
        })
        .get();

    ctx.set('data', {
        title: 'Index',
        link: baseUrl,
        item,
    });
};
