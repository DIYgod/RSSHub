import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/ai/blog',
    categories: ['programming'],
    example: '/meta/ai/blog',
    name: 'AI Blog',
    maintainers: ['TonyRL'],
    url: 'ai.meta.com/blog/',
    radar: [
        {
            source: ['ai.meta.com/blog/', 'ai.meta.com'],
        },
    ],
    handler,
};

async function handler(ctx) {
    const limit = Number.parseInt(ctx.req.query('limit') || 12, 10);
    const link = 'https://ai.meta.com/blog/';

    const res = await ofetch(link, {
        headers: {
            // All these headers are required
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
            'sec-fetch-user': '?1',
        },
    });
    const $ = load(res);
    const script = $('script:contains("DTSGInitialData"):first').text();
    const serverJs = JSON.parse(script.match(/\(new ServerJS\(\)\)\.handle\((\{[\s\S]*?\})\);/)?.[1] || '{}');

    type ServerData = {
        LSD: { token: string };
        SiteData: {
            haste_session: string;
            hsi: string;
            __spin_r: number;
            __spin_b: string;
            __spin_t: number;
        };
    };

    const server: ServerData = {
        LSD: { token: '' },
        SiteData: {
            haste_session: '',
            hsi: '',
            __spin_r: 0,
            __spin_b: 'trunk',
            __spin_t: Date.now(),
        },
    };

    for (const obj of serverJs.define) {
        const key = obj[0];
        const value = obj[2];
        server[key as keyof ServerData] = value;
    }

    const data = await ofetch('https://ai.meta.com/api/graphql/', {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'x-asbd-id': '359341',
            'x-fb-friendly-name': 'MetaAIBlogRecentPostSearchQuery',
            'x-fb-lsd': server.LSD.token,
        },
        body: new URLSearchParams({
            av: '0',
            __user: '0',
            __a: '1',
            __req: '1',
            // __hs: server.SiteData.haste_session || '',
            dpr: '1',
            __ccg: 'EXCELLENT',
            __rev: String(server.SiteData.__spin_r || ''),
            // __s: '',
            // __hsi: server.SiteData.hsi || '',
            // __dyn: '',
            // __hsdp: '',
            // __hblp: '',
            lsd: server.LSD.token,
            // jazoest: '',
            __spin_r: String(server.SiteData.__spin_r || ''),
            __spin_b: String(server.SiteData.__spin_b || 'trunk'),
            __spin_t: String(server.SiteData.__spin_t || Date.now()),
            fb_api_caller_class: 'RelayModern',
            fb_api_req_friendly_name: 'MetaAIBlogRecentPostSearchQuery',
            variables: JSON.stringify({ input: { query: '', from: 0, limit, tags: [], excludeObjectIDs: ['27568536916124137'] } }),
            server_timestamps: 'true',
            doc_id: '9516719638450392',
        }),
        parseResponse: JSON.parse,
    });

    const items = data.data.query.map((item) => ({
        title: item.title,
        description: item.description,
        link: item.href,
        pubDate: parseDate(item.date),
        category: [item.research_area],
        image: item.image,
    }));

    return {
        title: $('#pageTitle').text(),
        description: $('meta[name="description"]').attr('content'),
        image: $('link[rel="icon"]').attr('href'),
        link,
        item: items,
    };
}
