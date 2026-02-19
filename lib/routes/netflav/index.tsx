import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    radar: [
        {
            source: ['netflav.com/'],
            target: '',
        },
    ],
    name: 'Unknown',
    maintainers: ['TonyRL'],
    handler,
    url: 'netflav.com/',
    features: {
        nsfw: true,
    },
};

async function handler() {
    const baseUrl = 'https://netflav.com';
    const { data } = await got(baseUrl);

    const $ = load(data);
    const nextData = JSON.parse($('#__NEXT_DATA__').text());
    const {
        head,
        props: { initialState },
    } = nextData;

    const items = [...initialState.censored.docs, ...initialState.uncensored.docs, ...initialState.chinese.docs, ...initialState.trending.docs].map((item) => ({
        title: item.title,
        description: renderDescription([...new Set([item.preview_hp, item.preview, item.previewImagesUrl, ...(item.previewImages || [])])].filter(Boolean), item.description),
        link: `https://netflav.com/video?id=${item.videoId}`,
        pubDate: parseDate(item.sourceDate),
        author: [...new Set(item.actors.map((a) => a.replace(/^(\w{2}:)/, '')))].join(', '),
        category: [...new Set(item.tags?.map((t) => t.replace(/^(\w{2}:)/, '')))],
    }));

    return {
        title: head.find((h) => h[0] === 'title')[1].children,
        description: head.find((h) => h[0] === 'meta' && h[1].name === 'description')[1].content,
        logo: `${baseUrl}${head.find((h) => h[0] === 'meta' && h[1].property === 'og:image')[1].content}`,
        image: `${baseUrl}${head.find((h) => h[0] === 'meta' && h[1].property === 'og:image')[1].content}`,
        link: baseUrl,
        item: items,
        allowEmpty: true,
    };
}

const renderDescription = (images: string[], description: string): string =>
    renderToString(
        <>
            {images?.map((img, index) => (
                <img key={`${img}-${index}`} src={img} />
            ))}
            {description ? <p>{description}</p> : null}
        </>
    );
