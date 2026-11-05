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
        supportPodcast: true,
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
            </>
        ),
        link: item.permalink,
        guid: item.permalink,
        enclosure_url: item.play_sound_url || undefined,
        enclosure_type: item.play_sound_url ? 'audio/mpeg' : undefined,
        pubDate: item.written_on ? parseDate(item.written_on) : undefined,
        author: item.author,
    }));

    return {
        title: 'Urban Dictionary: Random words',
        link: `${baseUrl}/random.php`,
        item: items,
    };
}
