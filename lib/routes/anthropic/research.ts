import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/research',
    categories: ['programming'],
    example: '/anthropic/research',
    parameters: {},
    radar: [
        {
            source: ['www.anthropic.com/research', 'www.anthropic.com'],
        },
    ],
    name: 'Research',
    maintainers: ['ttttmr'],
    handler,
    url: 'www.anthropic.com/research',
};

async function handler() {
    const link = 'https://www.anthropic.com/research';
    const response = await ofetch(link);
    const $ = load(response);

    // self.__next_f.push
    const regexp = /self\.__next_f\.push\((.+)\)/;
    const textList: string[] = [];
    for (const e of $('script').toArray()) {
        const $e = $(e);
        const text = $e.text();
        const match = regexp.exec(text);
        if (match) {
            let data;
            try {
                data = JSON.parse(match[1]);
                if (Array.isArray(data) && data.length === 2 && data[0] === 1) {
                    textList.push(data[1]);
                }
            } catch {
                // ignore
            }
        }
    }

    const partRegex = /^([0-9a-zA-Z]+):([0-9a-zA-Z]+)?(\[.*)$/;
    const fd = textList
        .join('')
        .split('\n')
        .map((d) => {
            const matchPart = partRegex.exec(d);
            if (matchPart) {
                return {
                    id: matchPart[1],
                    tag: matchPart[2],
                    data: JSON.parse(matchPart[3]),
                };
            }
            return {
                id: '',
                tag: '',
                data: d,
            };
        });

    const sections = fd.flatMap((d) => (Array.isArray(d.data) ? d.data : [])).flatMap((item) => item?.page?.sections ?? []);
    const tabPages = sections.flatMap((section) => section?.tabPages ?? []).filter((tabPage) => tabPage?.label === 'Overview');
    const publicationSections = tabPages.flatMap((tabPage) => tabPage.sections).filter((section) => section?.title === 'Publications');
    const posts = publicationSections
        .flatMap((section) => section?.posts ?? [])
        .map((post) => ({
            title: post.title,
            link: `https://www.anthropic.com/research/${post.slug.current}`,
            pubDate: parseDate(post.publishedOn),
        }));

    const items = await pMap(
        posts,
        (item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                const content = $('div[class*="PostDetail_post-detail__"]');
                content.find('img').each((_, e) => {
                    const $e = $(e);
                    $e.removeAttr('style srcset');
                    const src = $e.attr('src');
                    const params = new URLSearchParams(src);
                    const newSrc = params.get('/_next/image?url');
                    if (newSrc) {
                        $e.attr('src', newSrc);
                    }
                });

                item.description = content.html();

                return item;
            }),
        { concurrency: 5 }
    );

    return {
        title: 'Anthropic Research',
        link,
        description: 'Latest research from Anthropic',
        item: items,
    };
}
