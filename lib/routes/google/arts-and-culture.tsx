import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/arts-and-culture',
    categories: ['design'],
    example: '/google/arts-and-culture',
    name: 'Arts & Culture featured stories',
    maintainers: ['DIYgod'],
    radar: [{ source: ['artsandculture.google.com'], target: '/arts-and-culture' }],
    handler,
};

async function handler() {
    const link = 'https://artsandculture.google.com/';
    const response = await ofetch(link);
    const $ = load(response);
    const items = $('a[data-gacategory="editorial"][href]')
        .toArray()
        .filter((element) => {
            const card = $(element);
            return /^\/(?:story|theme|project|exhibit)\//.test(card.attr('href')!) && card.attr('data-gaeditorialname') !== 'SimpleStack' && card.attr('title');
        })
        .map((element) => {
            const card = $(element);
            const image = card.find('[data-bgsrc]').first().attr('data-bgsrc');
            return {
                title: card.attr('title')!,
                link: new URL(card.attr('href')!, link).href,
                description: renderToString(
                    <>
                        {image && <img src={image} alt="" />}
                        <p>{card.find('.hwdZXd').text()}</p>
                    </>
                ),
            };
        });
    return { title: 'Google Arts & Culture - Featured stories', link, item: new Map(items.map((item) => [item.link, item])).values().toArray() };
}
