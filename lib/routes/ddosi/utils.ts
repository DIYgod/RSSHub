import { load } from 'cheerio';

import type { DataItem } from '@/types';
import { PRESETS } from '@/utils/header-generator';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

type Post = {
    title: { rendered: string };
    content: { rendered: string };
    link: string;
    date_gmt: string;
    _embedded?: {
        author?: Array<{ name: string }>;
        'wp:term'?: Array<Array<{ name: string }>>;
        'wp:featuredmedia'?: Array<{ source_url: string }>;
    };
};

export const getFirstPage = async (url: string): Promise<DataItem[]> => {
    const response = await ofetch(url, { headerGeneratorOptions: PRESETS.MODERN_IOS });
    const $ = load(response);
    const ids = $('main > article')
        .toArray()
        .map(
            (element) =>
                $(element)
                    .attr('id')
                    ?.match(/^post-(\d+)$/)?.[1]
        )
        .filter(Boolean);
    if (!ids.length) {
        return [];
    }

    const posts = await ofetch<Post[]>(new URL('/wp-json/wp/v2/posts', url).href, {
        query: {
            include: ids.join(','),
            per_page: ids.length,
            orderby: 'include',
            _embed: true,
        },
    });
    return posts.map((post) => ({
        title: post.title.rendered,
        link: post.link,
        description: post.content.rendered,
        pubDate: parseDate(`${post.date_gmt}Z`),
        author: post._embedded?.author?.map((author) => author.name).join(', '),
        category: post._embedded?.['wp:term']?.flat().map((term) => term.name),
        image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url,
    }));
};
