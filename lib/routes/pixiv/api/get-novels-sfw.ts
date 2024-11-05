import got from '@/utils/got';
import cache from '@/utils/cache';
import pixivUtils from '../utils';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.pixiv.net';
interface sfwNovelWork {
    id: string;
    title: string;
    genre: string;
    xRestrict: number;
    restrict: number;
    url: string;
    tags: string[];
    userId: string;
    userName: string;
    profileImageUrl: string;
    textCount: number;
    wordCount: number;
    readingTime: number;
    useWordCount: boolean;
    description: string;
    isBookmarkable: boolean;
    bookmarkData: null;
    bookmarkCount: number;
    isOriginal: boolean;
    marker: null;
    titleCaptionTranslation: {
        workTitle: null;
        workCaption: null;
    };
    createDate: string;
    updateDate: string;
    isMasked: boolean;
    aiType: number;
    seriesId: string;
    seriesTitle: string;
    isUnlisted: boolean;
}

interface sfwNovelsResponse {
    data: {
        error: boolean;
        message: string;
        body: {
            works: Record<string, sfwNovelWork>;
            extraData: {
                meta: {
                    title: string;
                    description: string;
                    canonical: string;
                    ogp: {
                        description: string;
                        image: string;
                        title: string;
                        type: string;
                    };
                    twitter: {
                        description: string;
                        image: string;
                        title: string;
                        card: string;
                    };
                    alternateLanguages: {
                        ja: string;
                        en: string;
                    };
                    descriptionHeader: string;
                };
            };
        };
    };
}

interface sfwNovelDetail {
    body: {
        content: string;
        textEmbeddedImages: Record<
            string,
            {
                novelImageId: string;
                sl: string;
                urls: {
                    original: string;
                    '1200x1200': string;
                    '480mw': string;
                    '240mw': string;
                    '128x128': string;
                };
            }
        >;
    };
}

async function getNovelFullContent(novel_id: string): Promise<{ content: string; images: Record<string, string> }> {
    const url = `${baseUrl}/ajax/novel/${novel_id}`;
    return (await cache.tryGet(url, async () => {
        const response = await got(url, {
            headers: {
                referer: `${baseUrl}/novel/show.php?id=${novel_id}`,
            },
        });

        const novelDetail = response.data as sfwNovelDetail;

        if (!novelDetail) {
            throw new Error('No novel data found');
        }

        const images: Record<string, string> = {};

        if (novelDetail.body.textEmbeddedImages) {
            for (const [id, image] of Object.entries(novelDetail.body.textEmbeddedImages)) {
                images[id] = pixivUtils.getProxiedImageUrl(image.urls.original);
            }
        }

        return {
            content: novelDetail.body.content,
            images,
        };
    })) as { content: string; images: Record<string, string> };
}

export async function getNonR18Novels(id: string, fullContent: boolean, limit: number = 100) {
    const url = `${baseUrl}/users/${id}/novels`;
    const { data: allData } = await got(`${baseUrl}/ajax/user/${id}/profile/all`, {
        headers: {
            referer: url,
        },
    });

    const novels = Object.keys(allData.body.novels)
        .sort((a, b) => Number(b) - Number(a))
        .slice(0, Number.parseInt(String(limit), 10));

    if (novels.length === 0) {
        throw new Error('No novels found, fallback to R18 API');
        // Throw error early to avoid unnecessary API requests
        // Since hasPixivAuth() check failed earlier and R18 API requires authentication, this will result in ConfigNotFoundError
    }

    const searchParams = new URLSearchParams();
    for (const novel of novels) {
        searchParams.append('ids[]', novel);
    }

    const { data } = (await got(`${baseUrl}/ajax/user/${id}/profile/novels`, {
        headers: {
            referer: url,
        },
        searchParams,
    })) as sfwNovelsResponse;

    const items = await Promise.all(
        Object.values(data.body.works).map(async (item) => {
            const baseItem = {
                title: item.title,
                description: `
                    <img src=${pixivUtils.getProxiedImageUrl(item.url)} />
                    <p>${item.description}</p>
                    <p>
                    字數：${item.textCount}<br>
                    閱讀時間：${item.readingTime} 分鐘<br>
                    收藏數：${item.bookmarkCount}<br>
                    </p>
                `,
                link: `${baseUrl}/novel/show.php?id=${item.id}`,
                author: item.userName,
                pubDate: parseDate(item.createDate),
                updated: parseDate(item.updateDate),
                category: item.tags,
            };

            if (!fullContent) {
                return baseItem;
            }

            try {
                const { content: initialContent, images } = await getNovelFullContent(item.id);

                const content = await pixivUtils.parseNovelContent(initialContent, images);

                return {
                    ...baseItem,
                    description: `${baseItem.description}<hr>${content}`,
                };
            } catch {
                return baseItem;
            }
        })
    );

    return {
        title: data.body.extraData.meta.title,
        description: data.body.extraData.meta.ogp.description,
        image: pixivUtils.getProxiedImageUrl(Object.values(data.body.works)[0].profileImageUrl),
        link: url,
        item: items,
    };
}
