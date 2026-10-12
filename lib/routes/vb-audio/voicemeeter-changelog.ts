import { load } from 'cheerio';

import type { DataItem, Language, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/voicemeeter/changelog',
    categories: ['program-update'],
    example: '/vb-audio/voicemeeter/changelog',
    radar: [
        {
            source: ['forum.vb-audio.com/viewtopic.php'],
        },
    ],
    name: 'Voicemeeter Version History',
    maintainers: ['TonyRL'],
    handler,
    url: 'forum.vb-audio.com/viewtopic.php?t=498',
};

async function handler() {
    const baseUrl = 'https://forum.vb-audio.com';
    const link = `${baseUrl}/viewtopic.php?t=498`;

    const response = await ofetch(link);
    const $ = load(response);

    const starts = $('.pagination a[href*="start="]')
        .toArray()
        .map((a) => Number(new URL($(a).attr('href')!, baseUrl).searchParams.get('start')));
    const perPage = Math.min(...starts);
    const remaining = starts.length ? await Promise.all(Array.from({ length: Math.max(...starts) / perPage }, (_, i) => ofetch(`${link}&start=${(i + 1) * perPage}`))) : [];

    const parsePosts = (html: string) => {
        const $ = load(html);
        return $('.post')
            .toArray()
            .filter((post) => new URL($(post).find('.author a[href*="memberlist.php"]').attr('href')!, baseUrl).searchParams.get('u') === '2')
            .map((post): DataItem => {
                const $post = $(post);
                const postId = $post.attr('id')!;
                return {
                    title: $post.find('h3 a').text(),
                    link: `${baseUrl}/viewtopic.php?p=${postId.slice(1)}#${postId}`,
                    description: $post.find('.content').html()!,
                    author: $post.find('.author a[href*="memberlist.php"]').text(),
                    pubDate: parseDate($post.find('time').attr('datetime')!),
                };
            });
    };

    const items = [response, ...remaining].flatMap((page) => parsePosts(page));

    return {
        title: $('head title').text(),
        link,
        language: $('html').attr('lang') as Language,
        image: `${baseUrl}/favicon.ico`,
        item: items,
    };
}
