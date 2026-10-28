import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/releases',
    categories: ['program-update'],
    example: '/tiddlywiki/releases',
    url: 'tiddlywiki.com',
    name: 'Releases',
    maintainers: ['p3psi-boo'],
    radar: [
        {
            source: ['github.com/TiddlyWiki/TiddlyWiki5'],
            target: '/releases',
        },
        {
            source: ['tiddlywiki.com'],
            target: '/releases',
        },
    ],
    handler,
};

async function getReleaseDescription(url: string): Promise<string | undefined | null> {
    const details = await cache.tryGet(url, async () => {
        const response = await got(url);
        const $ = load(response.data);
        return { description: $('.tc-tiddler-body').html() };
    });
    return details.description;
}

async function handler() {
    const tagListUrl = 'https://github.com/TiddlyWiki/TiddlyWiki5/releases.atom';

    const response = await got({
        method: 'get',
        url: tagListUrl,
    });

    const $ = load(response.data);

    const alist = $('entry');

    const versionList = alist
        .toArray()
        .map((item) => {
            const $item = $(item);
            const text = $item.find('title').text();
            const date = $item.find('updated').text();
            const authors = $item
                .find('author')
                .toArray()
                .map((author) => ({ name: $(author).find('name').text(), url: $(author).find('uri').text() || undefined }))
                .filter((author) => author.name);
            // Extract a version such as v5.3.6.
            const version = text.match(/v\d+\.\d+\.\d+/)?.[0];
            return {
                version,
                pubDate: date ? parseDate(date) : undefined,
                author: authors.length ? authors : undefined,
            };
        })
        .filter((item) => item.version);

    const items = await pMap(
        versionList,
        async (item) => {
            const version = item.version!.slice(1);
            const url = `https://tiddlywiki.com/static/Release%2520${version}.html`;
            return { title: item.version!, link: url, pubDate: item.pubDate, author: item.author, description: await getReleaseDescription(url) };
        },
        { concurrency: 3 }
    );

    return {
        title: 'TiddlyWiki Releases',
        link: 'https://tiddlywiki.com/static/Releases.html',
        item: items,
    };
}
