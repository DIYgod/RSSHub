import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/argument_audio/:year?',
    categories: ['government'],
    example: '/supremecourt/argument_audio',
    parameters: { year: 'Year, current year by default' },
    name: 'Arguments Audios',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx: Context) {
    const { year = new Date().getFullYear() } = ctx.req.param();

    const rootUrl = 'https://www.supremecourt.gov';
    const imageUrl = `${rootUrl}/images/scous_seal.png`;
    const currentUrl = `${rootUrl}/oral_arguments/argument_audio/${year}`;
    const response = await ofetch(currentUrl);

    const $ = load(response);

    const list = $('.card-body table tbody tr td span a')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: new URL($item.attr('href')!, currentUrl).href,
            };
        }) as DataItem[];

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                content('#pagetitle').remove();

                item.description = content('#pagemaindiv').html() ?? undefined;
                item.title += ` : ${content('#ctl00_ctl00_MainEditable_mainContent_lblCaseName').text()}`;
                item.pubDate = timezone(parseDate(content('#ctl00_ctl00_MainEditable_mainContent_lblDate').text()), -5);

                item.itunes_item_image = imageUrl;
                item.enclosure_url = content('audio source').attr('src');
                item.enclosure_type = 'audio/mpeg';

                return item;
            })
        )
    );

    return {
        title: `Argument Audio ${year} - Supreme Court of the United States`,
        link: currentUrl,
        item: items as DataItem[],
        itunes_author: 'Supreme Court of the United States',
        image: imageUrl,
        allowEmpty: true,
    };
}
