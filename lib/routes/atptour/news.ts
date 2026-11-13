import { config } from '@/config';
import type { Route } from '@/types';
import { fetchGoogleNews } from '@/utils/google-news';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/news/:lang?',
    categories: ['sport'],
    example: '/atptour/news/en',
    parameters: { lang: 'en or es.' },
    radar: [
        {
            source: ['atptour.com'],
        },
    ],
    name: 'News',
    maintainers: ['LM1207'],
    handler,
};

async function handler(ctx) {
    const baseUrl = 'https://www.atptour.com';
    const favIcon = `${baseUrl}/assets/atptour/assets/favicon.ico`;
    const { lang = 'en' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 15);

    const link = `${baseUrl}/${lang}/-/tour/news/latest-filtered-results/0/${limit}`;
    let data;
    try {
        ({ data } = await got(link, {
            headers: {
                'user-agent': config.trueUA,
            },
        }));
    } catch {
        const feed = await fetchGoogleNews('site:atptour.com', { hl: lang === 'es' ? 'es-ES' : 'en-US', gl: lang === 'es' ? 'ES' : 'US', ceid: lang === 'es' ? 'ES:es' : 'US:en' });
        return {
            title: lang === 'en' ? 'News' : 'Noticias',
            link: `${baseUrl}/${lang}/news/news-filter-results`,
            description: lang === 'en' ? "News from the official site of men's professional tennis." : 'Noticias del sitio oficial del tenis profesional masculino.',
            language: lang,
            icon: favIcon,
            logo: favIcon,
            author: 'ATP',
            item: feed.items
                .map((item) => ({
                    title: item.title ?? '',
                    link: item.link,
                    description: item.content ?? item.contentSnippet,
                    pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
                }))
                .filter((item) => item.title),
        };
    }

    return {
        title: lang === 'en' ? 'News' : 'Noticias',
        link: `${baseUrl}/${lang}/news/news-filter-results`,
        description: lang === 'en' ? "News from the official site of men's professional tennis." : 'Noticias del sitio oficial del tenis profesional masculino.',
        language: lang,
        icon: favIcon,
        logo: favIcon,
        author: 'ATP',
        item: data.content.map((item) => ({
            title: item.title,
            link: baseUrl + item.url,
            description: item.description,
            author: item.byline,
            category: item.category,
            pubDate: parseDate(item.authoredDate),
            image: baseUrl + item.image,
        })),
    };
}
