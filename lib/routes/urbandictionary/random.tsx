import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/random',
    categories: ['other'],
    example: '/urbandictionary/random',
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
            source: ['urbandictionary.com/random.php', 'urbandictionary.com/'],
        },
    ],
    name: 'Random words',
    maintainers: ['TonyRL'],
    handler,
    url: 'urbandictionary.com/random.php',
};

async function handler() {
    const baseUrl = 'https://www.urbandictionary.com';
    const { data } = await got('https://api.urbandictionary.com/v0/random');

    const items = data.list.map((item) => ({
        title: item.word,
        description: renderToString(
            <>
                {item.definition ? (
                    <>
                        {item.definition}
                        <br />
                    </>
                ) : null}
                {item.example ? (
                    <>
                        <i>{item.example}</i>
                        <br />
                    </>
                ) : null}
                {item.author ? (
                    <>
                        by <a href={`https://www.urbandictionary.com/author.php?author=${item.author}`}>{item.author}</a>
                    </>
                ) : null}
            </>
        ),
        link: `${baseUrl}/define.php?term=${item.word}`,
        guid: item.permalink,
        pubDate: parseDate(item.written_on),
        author: item.author,
    }));

    return {
        title: 'Urban Dictionary: Random words',
        link: `${baseUrl}/random.php`,
        item: items,
    };
}
