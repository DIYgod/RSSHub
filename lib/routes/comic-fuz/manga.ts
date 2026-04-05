import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/manga/:id',
    categories: ['anime'],
    example: '/comic-fuz/manga/218',
    parameters: { id: 'ComicFuz中对应的漫画id' },
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
            source: ['comic-fuz.com/manga/:id'],
            target: '/manga/:id',
        },
    ],
    name: '漫画详情',
    maintainers: ['xiaobailoves'],

    handler: async (ctx) => {
        const { id } = ctx.req.param();
        const baseUrl = 'https://comic-fuz.com';
        const openUrl = `${baseUrl}/manga/${id}`;
        const imgUrl = `https://img.comic-fuz.com`;

        const response = await ofetch(openUrl, {
            headers: {
                Referer: 'https://comic-fuz.com/',
                'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
            },
        });

        const $ = load(response);
        const nextDataText = $('#__NEXT_DATA__').text();

        if (!nextDataText) {
            throw new Error('无法解析页面数据，请检查漫画 ID 是否正确或页面结构是否变动');
        }

        const nextData = JSON.parse(nextDataText);
        const pageProps = nextData.props?.pageProps;

        if (!pageProps) {
            throw new Error('无法解析页面 Props 数据');
        }

        const mangaTitle = $('title').text().trim();
        const mangaAuthor = pageProps.authorships?.map((item: any) => item.author?.authorName).join(', ') || '';
        const mangaDescription = pageProps.manga?.longDescription || '';

        const chapterGroups = pageProps.chapters || [];

        const allChapters = chapterGroups.flatMap((group: any) => group.chapters || []);

        const items = allChapters.map((chapter: any) => {
            const pointInfo = chapter.pointConsumption;
            const amount = pointInfo?.amount || 0;

            let statusText = '';
            if (pointInfo && Object.keys(pointInfo).length === 0) {
                statusText = '无料';
            } else if (amount > 0) {
                statusText = '付费';
            }

            let thumb = chapter.thumbnailUrl;
            if (thumb && thumb.startsWith('/')) {
                thumb = `${imgUrl}${thumb}`;
            }

            const fullTitle = `${chapter.chapterMainName}${chapter.chapterSubName ? ` - ${chapter.chapterSubName}` : ''}`;

            return {
                title: fullTitle,
                link: `${baseUrl}/manga/viewer/${chapter.chapterId}`,
                description: `
                    ${thumb ? `<img src="${thumb}" style="max-width: 100%;"><br>` : ''}
                    ${amount > 0 ? `<p>价格: ${amount} 金币/铜币</p>` : ''}
                `,
                guid: `comicfuz-comic-id-${chapter.chapterId}`,
                category: statusText,
                author: mangaAuthor,
                pubDate: chapter.updatedDate ? parseDate(chapter.updatedDate, 'YYYY/MM/DD') : undefined,
                upvotes: chapter.numberOfLikes || 0,
                comments: chapter.numberOfComments || 0,
            };
        });

        return {
            title: `COMIC FUZ - ${mangaTitle}`,
            link: openUrl,
            description: mangaDescription,
            item: items,
            language: 'ja',
        };
    },
};
