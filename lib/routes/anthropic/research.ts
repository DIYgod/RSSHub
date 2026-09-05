import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
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

async function handler(ctx) {
    const link = 'https://www.anthropic.com/research';
    const response = await ofetch(link);
    const $ = load(response);
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 20;

    // self.__next_f.push
    const regexp = /self\.__next_f\.push\((.+)\)/;
    const textList: string[] = [];
    for (const e of $('script').toArray()) {
        const $e = $(e);
        const text = $e.text();
        const match = regexp.exec(text);
        if (match) {
            try {
                const data = JSON.parse(match[1]);
                if (Array.isArray(data) && data.length === 2 && data[0] === 1) {
                    textList.push(data[1]);
                }
            } catch {
                // ignore
            }
        }
    }

    const partRegex = /^([0-9a-z]+):([0-9a-z]+)?(\[.*)$/i;
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

    // The publication list used to sit at a fixed `page.sections` path. It is now nested deeper in
    // the flight payload, so walk the parsed data and pick the section up wherever it happens to be.
    const publicationSections: any[] = [];
    const collect = (node: any) => {
        if (!node || typeof node !== 'object') {
            return;
        }
        if (Array.isArray(node)) {
            for (const child of node) {
                collect(child);
            }
            return;
        }
        if (node.title === 'Publications' && Array.isArray(node.posts)) {
            publicationSections.push(node);
        }
        for (const child of Object.values(node)) {
            collect(child);
        }
    };
    for (const d of fd) {
        collect(d.data);
    }

    const seen = new Set<string>();
    const posts = publicationSections
        .flatMap((section) => section?.posts ?? [])
        .filter((post) => {
            const slug = post?.slug?.current;
            if (!slug || seen.has(slug)) {
                return false;
            }
            seen.add(slug);
            return true;
        })
        .slice(0, limit)
        .map((post): DataItem => ({
            title: post.title,
            link: `https://www.anthropic.com/research/${post.slug.current}`,
            pubDate: parseDate(post.publishedOn),
        }));

    const items = await pMap(
        posts,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);

                const content = $('#main-content > article');
                content
                    .find('[class$="__header"], [class$="__sidebar-container"], [class$="__controls"], [class$="__socialShare"], [class^="LandingPageSection-module-scss-module__"], [class^="SubjectNewsletter-module-scss-module__"]')
                    .remove();
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
