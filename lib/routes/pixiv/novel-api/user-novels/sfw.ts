import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import pixivUtils from '../../utils';
import { getSFWNovelContent } from '../content/sfw';
import type { SFWNovelsResponse, NovelList } from './types';

const baseUrl = 'https://www.pixiv.net';

export async function getSFWUserNovels(id: string, fullContent: boolean = false, limit: number = 100): Promise<NovelList> {
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
        throw new Error('No novels found for this user, or is an R18 creator, fallback to ConfigNotFoundError');
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
    })) as SFWNovelsResponse;

    const items = await Promise.all(
        Object.values(data.body.works).map(async (item) => {
            const baseItem = {
                title: item.title,
                description: `
                    <img src=${pixivUtils.getProxiedImageUrl(item.url)} />
                    <div>
                    <p>${item.description}</p>
                    </div>
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

            const { content } = await getSFWNovelContent(item.id);

            return {
                ...baseItem,
                description: `${baseItem.description}<hr>${content}`,
            };
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
