import { Data, Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import { getToken } from './token';
import getNovels, { getNovelContent, NovelData, parseNovelContent, PixivResponse } from './api/get-novels';
import { config } from '@/config';
import { parseDate } from '@/utils/parse-date';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import pixivUtils from './utils';
import got from '@/utils/got';
import { fallback, queryToBoolean } from '@/utils/readable-social';
import logger from '@/utils/logger';

const baseUrl = 'https://www.pixiv.net';

export const route: Route = {
    path: '/user/novels/:id/:full_content?',
    categories: ['social-media'],
    view: ViewType.Articles,
    example: '/pixiv/user/novels/27104704',
    parameters: {
        id: "User id, available in user's homepage URL",
        full_content: {
            description: 'Enable or disable the display of full content. ',
            options: [
                { value: 'true', label: 'true' },
                { value: 'false', label: 'false' },
            ],
            default: 'true',
        },
    },
    features: {
        requireConfig: [
            {
                name: 'PIXIV_REFRESHTOKEN',
                optional: true,
                description: `
Pixiv 登錄後的 refresh_token，用於獲取 R18 小說
refresh_token after Pixiv login, required for accessing R18 novels
[https://docs.rsshub.app/deploy/config#pixiv](https://docs.rsshub.app/deploy/config#pixiv)`,
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.pixiv.net/users/:id/novels'],
            target: '/user/novels/:id',
        },
    ],
    name: 'User Novels',
    maintainers: ['TonyRL', 'SnowAgar25'],
    handler,
    description: `
| 小說類型 Novel Type | full_content | PIXIV_REFRESHTOKEN | 返回內容 Content |
|-------------------|--------------|-------------------|-----------------|
| Non R18           | false        | 不需要 Not Required  | 簡介 Basic info |
| Non R18           | true         | 不需要 Not Required  | 全文 Full text  |
| R18               | false        | 需要 Required       | 簡介 Basic info |
| R18               | true         | 需要 Required       | 全文 Full text  |
Example:
- \`/pixiv/user/novels/79603797\` → 全文 Full text
- \`/pixiv/user/novels/79603797/false\` → 簡介 Basic info`,
};

interface NovelWork {
    id: string | number;
    title: string;
    seriesTitle?: string;
    description?: string;
    userName: string;
    createDate: string;
    updateDate: string;
    tags: string[];
    profileImageUrl: string;
}

interface NovelDetail {
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
        for (const [id, image] of Object.entries(data.body.textEmbeddedImages as NovelDetail)) {
            images[id] = pixivUtils.getProxiedImageUrl(image.urls.original);
        }
    }

    // 如果有 [pixivimage:(\d+)] 的引用，因爲沒有 PIXIV_REFRESHTOKEN，將無法獲取作品 Detail，也無法正常顯示
    // For references of [pixivimage:(\d+)], without PIXIV_REFRESHTOKEN, artwork details cannot be retrieved and images cannot be displayed normally

    return {
        content: data.body.content,
        images,
    };
}

async function getNonR18Novels(id: string, limit: number = 100, fullContent: boolean) {
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

    const { data } = await got(`${baseUrl}/ajax/user/${id}/profile/novels`, {
        headers: {
            referer: url,
        },
        searchParams,
    });

    const items = await Promise.all(
        Object.values(data.body.works as Record<string, NovelWork>).map(async (item) => {
            const baseItem = {
                title: item.seriesTitle || item.title,
                description: item.description || item.title,
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
                const { content, images } = await getNovelFullContent(String(item.id));
                let fullContent = content;

                // Replace image placeholders with actual images
                fullContent = fullContent.replaceAll(/\[uploadedimage:(\d+)\]/g, (match, imageId) => {
                    if (images[imageId]) {
                        return `<img src="${images[imageId]}" alt="novel illustration ${imageId}">`;
                    }
                    return match;
                });

                return {
                    ...baseItem,
                    description: `
                        <p>${item.description || item.title}</p>
                        <hr>
                        ${fullContent}
                    `,
                };
            } catch {
                return baseItem;
            }
        })
    );

    return {
        title: data.body.extraData.meta.title,
        description: data.body.extraData.meta.ogp.description,
        image: Object.values(data.body.works as Record<string, NovelWork>)[0].profileImageUrl,
        link: url,
        item: items,
    };
}

async function getR18Novels(id: string, fullContent: boolean) {
    if (!config.pixiv || !config.pixiv.refreshToken) {
        throw new ConfigNotFoundError(
            '該用戶爲 R18 創作者，需要 PIXIV_REFRESHTOKEN。This user is an R18 creator, PIXIV_REFRESHTOKEN is required - pixiv RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>'
        );
    }

    const token = await getToken(cache.tryGet);
    if (!token) {
        throw new ConfigNotFoundError('pixiv not login');
    }

    const response = (await getNovels(id, token)) as PixivResponse;
    const novels = response.data.novels;
    const username = novels[0].user.name;

    const items = await Promise.all(
        novels.map(async (novel) => {
            const baseItem = {
                title: novel.series?.title ? `${novel.series.title} - ${novel.title}` : novel.title,
                // 使用 novel.caption 會有`pixiv://`這種協議
                description: `
                    <img src="${pixivUtils.getProxiedImageUrl(novel.image_urls.large)}" />
                    <p>${novel.caption || ''}</p>
                    <p>
                    字數：${novel.text_length}<br>
                    閱覽數：${novel.total_view}<br>
                    收藏數：${novel.total_bookmarks}<br>
                    評論數：${novel.total_comments}<br>
                    </p>`,
                author: novel.user.name,
                pubDate: parseDate(novel.create_date),
                link: `https://www.pixiv.net/novel/show.php?id=${novel.id}`,
                category: novel.tags.map((t) => t.name),
            };

            if (!fullContent) {
                return baseItem;
            }

            try {
                const contentResponse = await getNovelContent(novel.id, token);
                const { content, novelData } = (await parseNovelContent(contentResponse.data, token)) as {
                    novelData: NovelData;
                    content: string;
                };

                return {
                    ...baseItem,
                    novelData,
                    description: `${baseItem.description}<hr>${content}`,
                };
            } catch {
                return baseItem;
            }
        })
    );

    return {
        title: `${username} 的 pixiv 小说`,
        description: `${username} 的 pixiv 最新小说`,
        image: pixivUtils.getProxiedImageUrl(novels[0].user.profile_image_urls.medium),
        link: `https://www.pixiv.net/users/${id}/novels`,
        item: items,
    };
}

async function handler(ctx): Promise<Data> {
    const id = ctx.req.param('id');
    logger.debug(ctx.req.param('full_content'));
    const fullContent = fallback(undefined, queryToBoolean(ctx.req.param('full_content')), true);

    const { limit } = ctx.req.query();

    const nonR18Result = await getNonR18Novels(id, limit, fullContent).catch(() => null);
    if (nonR18Result) {
        return nonR18Result;
    }

    return await getR18Novels(id, fullContent);
}
