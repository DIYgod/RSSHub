import { config } from '@/config';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news/:lang?',
    categories: ['other'],
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
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 15;

    const link = `${baseUrl}/${lang}/-/tour/news/latest-filtered-results/0/${limit}`;
    const { data } = await got(link, {
        headers: {
            'user-agent': config.trueUA,
        },
    });

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
