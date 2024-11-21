import got from '../../pixiv-got';
import { maskHeader } from '../../constants';
import queryString from 'query-string';
import { config } from '@/config';
import pixivUtils from '../../utils';
import { getNSFWNovelContent } from '../content/nsfw';
import { parseDate } from '@/utils/parse-date';
import { convertPixivProtocolExtended } from '../content/utils';
import type { NSFWNovelsResponse, NovelList } from './types';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import cache from '@/utils/cache';
import { getToken } from '../../token';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import { getNovelLanguage } from '../content/common';

function getNovels(user_id: string, token: string): Promise<NSFWNovelsResponse> {
    return got('https://app-api.pixiv.net/v1/user/novels', {
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
        searchParams: queryString.stringify({
            user_id,
            filter: 'for_ios',
        }),
    });
}

export async function getNSFWUserNovels(id: string, fullContent: boolean = false, limit: number = 100): Promise<NovelList> {
    if (!config.pixiv || !config.pixiv.refreshToken) {
        throw new ConfigNotFoundError('This user is an R18 creator, PIXIV_REFRESHTOKEN is required.\npixiv RSS is disabled due to the lack of relevant config.\n該用戶爲 R18 創作者，需要 PIXIV_REFRESHTOKEN。');
    }

    const token = await getToken(cache.tryGet);
    if (!token) {
        throw new ConfigNotFoundError('pixiv not login');
    }

    const response = await getNovels(id, token);
    const novels = limit ? response.data.novels.slice(0, limit) : response.data.novels;

    if (novels.length === 0) {
        throw new InvalidParameterError(`${id} is not a valid user ID, or the user has no novels.\n${id} 不是有效的用戶 ID，或者該用戶沒有小說作品。`);
    }

    const username = novels[0].user.name;

    const items = await Promise.all(
        novels.map(async (novel) => {
            const language = await getNovelLanguage(novel.id);
            const baseItem = {
                title: novel.series?.title ? `${novel.series.title} - ${novel.title}` : novel.title,
                description: `
                    <img src="${pixivUtils.getProxiedImageUrl(novel.image_urls.large)}" />
                    <div lang="${language}">
                    <p>${convertPixivProtocolExtended(novel.caption)}</p>
                    </div>`,
                author: novel.user.name,
                pubDate: parseDate(novel.create_date),
                link: `https://www.pixiv.net/novel/show.php?id=${novel.id}`,
                category: novel.tags.map((t) => t.name),
            };

            if (!fullContent) {
                return baseItem;
            }

            const { content } = await getNSFWNovelContent(novel.id, token);

            return {
                ...baseItem,
                description: `${baseItem.description}<hr>${content}`,
            };
        })
    );

    return {
        title: `${username}'s novels - pixiv`,
        description: `${username} 的 pixiv 最新小说`,
        image: pixivUtils.getProxiedImageUrl(novels[0].user.profile_image_urls.medium),
        link: `https://www.pixiv.net/users/${id}/novels`,
        item: items,
    };
}
