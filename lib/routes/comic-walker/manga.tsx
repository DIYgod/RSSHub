import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const getEpisodes = (obj: any) => obj?.result || obj?.items || (Array.isArray(obj) ? obj : []);

export const route: Route = {
    path: '/manga/:id',
    categories: ['anime'],
    example: '/comic-walker/manga/KC_006778_S',
    parameters: { id: 'カドコミ(Kadocomi)中对应的作品workCode，例如 KC_006778_S' },
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
            source: ['comic-walker.com/detail/:id', 'kadocomi.jp/detail/:id'],
            target: '/comic-walker/manga/:id',
        },
    ],
    name: 'カドコミ(Kadocomi)漫画详情',
    maintainers: ['xiaobailoves'],

    handler: async (ctx) => {
        const { id } = ctx.req.param();
        const baseUrl = 'https://comic-walker.com';

        const fetchUrl = `${baseUrl}/detail/${id}?episodeType=first`;
        const openUrl = `${baseUrl}/detail/${id}`;

        const response = await ofetch(fetchUrl, {
            headers: {
                Referer: baseUrl,
                'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
            },
        });

        const $ = load(response);
        const nextDataText = $('#__NEXT_DATA__').text();

        if (!nextDataText) {
            throw new Error('无法解析页面 HTML 数据，可能触发了反爬策略或页面结构巨变');
        }

        const nextData = JSON.parse(nextDataText);
        const queries = nextData.props?.pageProps?.dehydratedState?.queries || [];

        const workQuery = queries.find((q: any) => q.queryKey?.includes('/api/contents/details/work') || (Array.isArray(q.queryKey) && q.queryKey.some((k: any) => typeof k === 'string' && k.includes('work'))));

        if (!workQuery || !workQuery.state?.data) {
            throw new Error('无法在 HTML 缓存中提取核心数据对象');
        }

        const data = workQuery.state.data;
        const work = data.work;

        if (!work) {
            throw new Error('成功获取数据对象，但未找到作品基本信息');
        }

        const mangaTitle = work.title || $('title').text().trim();
        const mangaAuthor = work.authors?.map((author: any) => author.name).join(', ') || '';
        const mangaDescription = work.summary || '';
        const coverImage = work.bookCover || work.thumbnail;

        const firstEpisodes = getEpisodes(data.firstEpisodes);
        const latestEpisodes = getEpisodes(data.latestEpisodes);
        const extraEpisodes = getEpisodes(data.episodes);

        const episodesMap = new Map();
        for (const ep of [...firstEpisodes, ...latestEpisodes, ...extraEpisodes]) {
            if (ep && ep.code) {
                episodesMap.set(ep.code, ep);
            }
        }

        const allChapters = [...episodesMap.values()].toSorted((a: any, b: any) => (b.internal?.episodeNo || 0) - (a.internal?.episodeNo || 0));

        if (allChapters.length === 0) {
            throw new Error(` HTML 缓存中无章节!`);
        }

        let maxAllowedTime = Date.now();

        const items = allChapters.map((chapter: any) => {
            const epType = chapter.type === 'normal' ? '正篇' : '特别篇/PR';
            const isReadStatus = chapter.isActive ? '' : ' (未解锁/仍需等待)';
            const fullTitle = `${chapter.title}${chapter.subTitle ? ` - ${chapter.subTitle}` : ''}${isReadStatus}`;
            const thumb = chapter.originalThumbnail || chapter.thumbnail;

            let currentPubDate = chapter.updateDate ? parseDate(chapter.updateDate) : undefined;

            if (currentPubDate) {
                if (currentPubDate.getTime() > maxAllowedTime) {
                    currentPubDate = new Date(maxAllowedTime - 1000);
                }
                maxAllowedTime = currentPubDate.getTime();
            }

            return {
                title: fullTitle,
                link: `${baseUrl}/detail/${id}/episodes/${chapter.code}`,
                description: renderToString(
                    <>
                        {thumb ? (
                            <>
                                <img src={thumb} style={{ maxWidth: '100%' }} />
                                <br />
                            </>
                        ) : null}
                        <p>类型: {epType}</p>
                    </>
                ),
                guid: `Kadocomi-manga-${chapter.code}`,
                category: epType,
                author: mangaAuthor,
                pubDate: currentPubDate,
            };
        });
        return {
            title: `Kadocomi - ${mangaTitle}`,
            link: openUrl,
            description: mangaDescription,
            image: coverImage,
            item: items,
            language: 'ja',
        };
    },
};
