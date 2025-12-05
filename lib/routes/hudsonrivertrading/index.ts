import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

type WordpressPost = {
    id: number;
    date: string;
    date_gmt?: string;
    link: string;
    title?: { rendered?: string };
    excerpt?: { rendered?: string };
    content?: { rendered?: string };
    _embedded?: {
        author?: Array<{ name?: string }>;
        'wp:term'?: Array<Array<{ name?: string }>>;
    };
};

const ROOT_URL = 'https://www.hudsonrivertrading.com';

const SECTION_LABELS: Record<string, string> = {
    algo: 'Algorithm',
    engineers: 'Engineering',
    interns: 'Intern Spotlight',
    more: 'Hardware, Systems & More',
};

// Find the category IDs at https://www.hudsonrivertrading.com/wp-json/wp/v2/categories
const SECTION_CATEGORY_IDS: Record<string, number> = {
    algo: 7,
    engineers: 11,
    interns: 16,
};

export const route: Route = {
    path: '/blog/:section?',
    categories: ['blog'],
    example: '/hudsonrivertrading/blog',
    parameters: {
        section: {
            description: 'Optional section filter',
            options: Object.entries(SECTION_LABELS).map(([value, label]) => ({ label, value })),
        },
    },
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
            source: ['www.hudsonrivertrading.com/hrtbeat/'],
        },
    ],
    name: 'Tech Blog',
    maintainers: ['johan456789'],
    handler,
    description: `HRT (Hudson River Trading) Tech Blog

| Route | Section |
| ----- | ------- |
| /hudsonrivertrading/blog | All Posts |
${Object.entries(SECTION_LABELS)
    .map(([key, label]) => `| /hudsonrivertrading/blog/${key} | ${label} |`)
    .join('\n')}`,
};

async function handler(ctx): Promise<Data> {
    const sectionParam = (ctx.req.param('section') ?? '').toLowerCase();
    const apiBase = `${ROOT_URL}/wp-json/wp/v2`;

    // Build query using fixed category IDs
    let categoriesQuery: { include?: number; exclude?: number[] } | undefined;
    if (sectionParam) {
        if (Object.hasOwn(SECTION_CATEGORY_IDS, sectionParam)) {
            categoriesQuery = { include: SECTION_CATEGORY_IDS[sectionParam] };
        } else if (sectionParam === 'more') {
            categoriesQuery = { exclude: Object.values(SECTION_CATEGORY_IDS) };
        } else {
            throw new InvalidParameterError(`Invalid section: ${sectionParam}. Valid sections are: ${Object.keys(SECTION_LABELS).join(', ')}`);
        }
    }
    // If sectionParam is empty/undefined, categoriesQuery remains undefined = all posts

    const searchParams: string[] = ['per_page=20', '_embed=author,wp:term'];
    if (categoriesQuery?.include) {
        searchParams.push(`categories=${categoriesQuery.include}`);
    }
    if (categoriesQuery?.exclude?.length) {
        searchParams.push(`categories_exclude=${categoriesQuery.exclude.join(',')}`);
    }

    const apiUrl = `${apiBase}/posts?${searchParams.join('&')}`;
    const data = await ofetch<WordpressPost[]>(apiUrl);

    const items = data.map((post) => ({
        title: post.title?.rendered,
        description: post.content?.rendered ?? post.excerpt?.rendered ?? '',
        link: post.link,
        pubDate: parseDate(post.date_gmt ?? post.date),
        author: post._embedded?.author?.[0]?.name,
        category: Array.isArray(post._embedded?.['wp:term'])
            ? post._embedded['wp:term']
                  .flat()
                  .map((term: any) => term?.name)
                  .filter(Boolean)
            : undefined,
    }));

    const sectionLabel = sectionParam && SECTION_LABELS[sectionParam] ? ` - ${SECTION_LABELS[sectionParam]}` : '';

    return {
        title: `Hudson River Trading${sectionLabel}`,
        link: `${ROOT_URL}/hrtbeat/#${sectionParam}`,
        language: 'en',
        item: items,
    } as Data;
}
