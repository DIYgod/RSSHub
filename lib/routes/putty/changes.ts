// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const rootUrl = 'https://www.chiark.greenend.org.uk';
    const currentUrl = `${rootUrl}/~sgtatham/putty/changes.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data.replaceAll('href="releases', 'class="version" href="releases'));

    const items = $('.version')
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.parent().text().split('in').pop();

            return {
                title,
                link: `${rootUrl}/~sgtatham/putty/${item.attr('href')}`,
                description: item.parent().next().html(),
                pubDate: parseDate(title.match(/\(released (.*)\)/)[1]),
            };
        });

    ctx.set('data', {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    });
};
