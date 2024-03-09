import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const language = ctx.req.param('language') ?? '';

    const rootUrl = 'https://sensortower.com';
    const currentUrl = `${rootUrl}${language ? `/${language}` : ''}/blog`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const data = response.data.match(/"uri":"(\/blog\/.*?)"/g);

    let items = data.map((item) => ({
        link: `${rootUrl}${language ? `/${language}` : ''}${item.match(/"(\/blog\/.*?)"/)[1]}`,
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);
                const detail = JSON.parse(`{${detailResponse.data.match(/("title":.*?),"body":/)[1]}}`);

                content('h1').remove();
                content('h5').parent().remove();
                content('div[data-testid="Text-embedded-entry-block"]').remove();

                content('img').each(function () {
                    const image = (content(this).attr('srcset') ?? content(this).attr('src')).split('?w=')[0];

                    content(this).replaceWith(
                        art(path.join(__dirname, 'templates/description.art'), {
                            image,
                        })
                    );
                });

                item.title = detail.title;
                item.author = detail.author.name;
                item.pubDate = parseDate(detail.pubDate, 'MMMM YYYY');
                item.category = [...(detail.tags?.map((t) => t.title) ?? []), ...(detail.category?.map((c) => c.title) ?? [])];
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    header: content('header[data-csk-entry-type="blog"]').html(),
                    description: content('div[data-csk-entry-type="blog"] div[data-testid="Text-root"]').html(),
                });

                return item;
            })
        )
    );

    ctx.set('data', {
        title: 'Sensor Tower - Blog',
        link: currentUrl,
        item: items,
        language: language || 'en-US',
    });
};
