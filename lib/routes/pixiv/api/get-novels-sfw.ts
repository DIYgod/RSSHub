import got from '@/utils/got';
import pixivUtils from '../utils';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

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

export interface sfwNovelDetail {
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

async function getNovelFullContent(novelId: string): Promise<{ content: string; images: Record<string, string> }> {
    const { data } = await got(`${baseUrl}/ajax/novel/${novelId}`, {
        headers: {
            referer: `${baseUrl}/novel/show.php?id=${novelId}`,
        },
    });

    const images: Record<string, string> = {};
    if (data.body.textEmbeddedImages) {
        for (const [id, image] of Object.entries(data.body.textEmbeddedImages as sfwNovelDetail)) {
            images[id] = pixivUtils.getProxiedImageUrl(image.urls.original);
        }
    }

    return {
        content: data.body.content,
        images,
    };
}
export async function getNonR18Novels(id: string, limit: number = 100, fullContent: boolean) {
    const url = `${baseUrl}/users/${id}/novels`;
    const { data: allData } = await got(`${baseUrl}/ajax/user/${id}/profile/all`, {
        headers: {
            referer: url,
        },
    });

    const novels = Object.keys(allData.body.novels)
        .sort((a, b) => Number(b) - Number(a))
        .slice(0, Number.parseInt(String(limit), 10));

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
                const { content: initialContent, images } = await getNovelFullContent(String(item.id));
                let content = initialContent;

                // 如果有 [pixivimage:(\d+)] 的引用，因爲沒有 PIXIV_REFRESHTOKEN，將無法獲取作品 Detail，也無法正常顯示
                // For references of [pixivimage:(\d+)], without PIXIV_REFRESHTOKEN, artwork details cannot be retrieved and images cannot be displayed normally

                content = content
                    .replaceAll(/\[uploadedimage:(\d+)\]/g, (match, imageId) => {
                        if (images[imageId]) {
                            return `<img src="${images[imageId]}" alt="novel illustration ${imageId}">`;
                        }
                        return match;
                    })
                    .replaceAll('\n', '<br>')
                    .replaceAll(/(<br>){2,}/g, '</p><p>')
                    .replaceAll(/\[\[rb:(.*?)>(.*?)\]\]/g, '<ruby>$1<rt>$2</rt></ruby>')
                    .replaceAll(/\[\[jumpuri:(.*?)>(.*?)\]\]/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
                    .replaceAll(/\[jump:(\d+)\]/g, 'Jump to page $1')
                    .replaceAll(/\[chapter:(.*?)\]/g, '<h2>$1</h2>')
                    .replaceAll('[newpage]', '<hr>');

                const $content = load(`<article><p>${content}</p></article>`);

                $content('p p').each((_, elem) => {
                    const $elem = $content(elem);
                    $elem.replaceWith($elem.html() || '');
                });

                $content('p h2').each((_, elem) => {
                    const $elem = $content(elem);
                    const $parent = $elem.parent('p');
                    const html = $elem.prop('outerHTML');
                    if ($parent.length && html) {
                        $parent.replaceWith(`</p>${html}<p>`);
                    }
                });

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
        image: Object.values(data.body.works as Record<string, sfwNovelWork>)[0].profileImageUrl,
        link: url,
        item: items,
    };
}
