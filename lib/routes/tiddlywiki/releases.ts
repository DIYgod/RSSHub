import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
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
            item = $(item);
            const text = item.find('title').text();
            const date = item.find('updated').text();
            // 使用正则提取 v5.3.6 格式
            const version = text.match(/v\d+\.\d+\.\d+/)?.[0];
            return {
                version,
                pubDate: parseDate(date),
            };
        })
        .filter((item) => item.version);

    const items = await Promise.all(
        versionList.map((item) => {
            const _version = item.version.slice(1);
            const url = `https://tiddlywiki.com/static/Release%2520${_version}.html`;
            return cache.tryGet(url, async () => {
                const response = await got({
                    method: 'get',
                    url,
                });

                const $ = load(response.data);

                const description = $('.tc-tiddler-body').html();

                return {
                    title: item.version,
                    link: url,
                    pubDate: item.pubDate,
                    description,
                };
            });
        })
    );

    return {
        title: 'TiddlyWiki Releases',
        link: 'https://tiddlywiki.com/static/Releases.html',
        item: items,
    };
}
