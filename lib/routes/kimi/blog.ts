import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface BlogItem {
    title: string;
    link: string;
    desc?: string;
    date: string;
    image: string;
}

interface BlogData {
    sections: Array<{
        items: BlogItem[];
    }>;
}

const baseUrl = 'https://www.kimi.com';

const extractBlogData = (jsContent: string): BlogItem[] => {
    // There are multiple encoded-data attributes; find the one with "sections" (blog listing)
    const matches = jsContent.matchAll(/"encoded-data":"([A-Za-z0-9+/=]+)"/g);
    for (const match of matches) {
        const decoded = Buffer.from(match[1], 'base64').toString();
        const data = JSON.parse(decoded);
        if ('sections' in data) {
            return (data as BlogData).sections.flatMap((section) => section.items);
        }
    }
    throw new Error('Blog data not found in lean.js');
};

const fetchDescription = (url: string): Promise<string> =>
    cache.tryGet(url, async () => {
        const html = await ofetch(url, { responseType: 'text' });
        const match = html.match(/<meta name="description" content="([^"]+)"/);
        return match?.[1] ?? '';
    });

export const route: Route = {
    path: '/blog',
    categories: ['programming'],
    example: '/kimi/blog',
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
            source: ['kimi.com/blog/'],
            target: '/kimi/blog',
        },
    ],
    name: 'Blog',
    maintainers: ['27Aaron'],
    url: 'kimi.com/blog',
    handler: async () => {
        // Step 1: Fetch index page to find the lean.js URL
        const html = await ofetch(`${baseUrl}/blog/`, { responseType: 'text' });

        // Step 2: Extract the index.md lean.js URL
        const jsMatch = html.match(/(?:src|href)="([^"]*?index\.md\.[^.]+\.lean\.js)"/);
        if (!jsMatch) {
            throw new Error('index.md lean.js not found');
        }

        let jsUrl = jsMatch[1];
        if (jsUrl.startsWith('//')) {
            jsUrl = `https:${jsUrl}`;
        } else if (jsUrl.startsWith('/')) {
            jsUrl = `${baseUrl}${jsUrl}`;
        }

        // Step 3: Fetch lean.js and extract blog data
        const jsContent = await ofetch(jsUrl, { responseType: 'text' });
        const items = extractBlogData(jsContent);

        // Step 4: Fetch descriptions for internal blog posts and map to RSS items
        const result = await Promise.all(
            items.map(async (item) => {
                const isInternal = item.link.startsWith('/');
                const link = isInternal ? `${baseUrl}${item.link}` : item.link;

                let description = '';
                if (isInternal) {
                    const metaDesc = await fetchDescription(link);
                    if (metaDesc) {
                        description = metaDesc;
                    }
                }
                if (!description && item.desc) {
                    description = item.desc;
                }

                return {
                    title: item.title,
                    link,
                    pubDate: parseDate(item.date, 'YYYY/MM/DD'),
                    description,
                };
            })
        );

        return {
            title: 'Kimi Blog',
            link: `${baseUrl}/blog/`,
            item: result,
        };
    },
};
