import { Route } from '@/types';
import { getMangaDetails } from './_feed';

export const route: Route = {
    path: '/manga/:id/:lang?',
    radar: [
        {
            source: ['mangadex.org/title/:id/:suffix', 'mangadex.org/title/:id'],
            target: '/manga/:id',
        },
    ],
    name: 'Single Manga Feed',
    maintainers: ['vzz64', 'chrisis58'],
    example: '/mangadex/manga/f98660a1-d2e2-461c-960d-7bd13df8b76d/en',
    handler,
    features: {
        nsfw: true,
    },
};

async function handler(ctx) {
    const { id, lang } = ctx.req.param();
    const mangaDetail = await getMangaDetails(id, lang);

    return {
        title: mangaDetail.title,
        link: `https://mangadex.org/title/${id}`,
        description: mangaDetail.description,
        item: mangaDetail.chapters.map((chapter) => ({
            title: chapter.title,
            link: chapter.link,
            pubDate: chapter.pubDate,
            image: mangaDetail.cover,
        })),
    };
}
