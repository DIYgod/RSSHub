import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const renderDescription = (desc: { description?: string; imglink?: string }) => renderToString(<WarthunderDescription description={desc.description} imglink={desc.imglink} />);

const WarthunderDescription = ({ description, imglink }: { description?: string; imglink?: string }) => (
    <>
        {description}
        <br />
        <img src={`https:${imglink ?? ''}`} />
    </>
);

export const route: Route = {
    path: '/news',
    categories: ['game'],
    example: '/warthunder/news',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['warthunder.com/en/news', 'warthunder.com/'],
        },
    ],
    name: 'News',
    maintainers: ['axojhf'],
    handler,
    url: 'warthunder.com/en/news',
    description: `News data from <https://warthunder.com/en/news/>
The \`pubDate\` provided under UTC time zone, so please ignore the specific time!!!`,
};

function parseSourceTime(value: string) {
    if (!value.trim()) {
        return;
    }
    const date = parseDate(value.trim(), 'D MMMM YYYY', 'en', true);
    return Number.isFinite(date.getTime()) ? timezone(date, 0) : undefined;
}

async function handler() {
    const rootUrl = 'https://warthunder.com/en/news/';

    const response = await ofetch(rootUrl);

    const $ = load(response);

    const list = $('div.showcase__item.widget')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const pubDate = parseSourceTime($item.find('div.widget__content > ul > li.widget-meta__item.widget-meta__item--right').text());
            const category: string[] = [];
            if ($item.find('div.widget__pin').length !== 0) {
                category.push('pinned');
            }
            if ($item.find('a.widget__decal').length !== 0) {
                category.push('decal');
            }
            if ($item.find('div.widget__badge').length !== 0) {
                category.push($item.find('div.widget__badge').text());
            }
            return {
                link: `https://warthunder.com${$item.find('a.widget__link').attr('href')}`,
                title: $item.find('div.widget__content > div.widget__title').text(),
                pubDate,
                description: renderDescription({
                    description: $item.find('div.widget__content > div.widget__comment').text(),
                    imglink: $item.find('div.widget__poster > img.widget__poster-media').attr('data-src'),
                }),
                category,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet<Pick<DataItem, 'description'>>(`warthunder:detail:${item.link}`, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                const content = $('section.article').first();
                if (!content.length) {
                    throw new Error(`War Thunder article has no body: ${item.link}`);
                }
                content.find('script, style').remove();
                content.find('img[data-src]').each((_, element) => {
                    const image = $(element);
                    image.attr('src', image.attr('data-src')!);
                });
                return { description: content.html() || undefined };
            });
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );

    return {
        title: 'War Thunder News',
        link: 'https://warthunder.com/en/news/',
        item: items,
    };
}
