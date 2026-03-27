import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Data, Route } from '@/types';
import { ViewType } from '@/types';
import { fallback, queryToBoolean } from '@/utils/readable-social';

import { getNSFWUserNovels } from './novel-api/user-novels/nsfw';
import { getSFWUserNovels } from './novel-api/user-novels/sfw';

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
            default: 'false',
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
        nsfw: true,
    },
    radar: [
        {
            title: 'User Novels (簡介 Basic info)',
            source: ['www.pixiv.net/users/:id/novels', 'www.pixiv.net/users/:id', 'www.pixiv.net/en/users/:id/novels', 'www.pixiv.net/en/users/:id'],
            target: '/user/novels/:id',
        },
        {
            title: 'User Novels (全文 Full text)',
            source: ['www.pixiv.net/users/:id/novels', 'www.pixiv.net/users/:id', 'www.pixiv.net/en/users/:id/novels', 'www.pixiv.net/en/users/:id'],
            target: '/user/novels/:id/true',
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

Default value for \`full_content\` is \`false\` if not specified.

Example:
- \`/pixiv/user/novels/79603797\` → 簡介 Basic info
- \`/pixiv/user/novels/79603797/true\` → 全文 Full text`,
};

const hasPixivAuth = () => Boolean(config.pixiv && config.pixiv.refreshToken);

async function handler(ctx): Promise<Data> {
    const id = ctx.req.param('id');
    const fullContent = fallback(undefined, queryToBoolean(ctx.req.param('full_content')), false);
    const { limit } = ctx.req.query();

    if (hasPixivAuth()) {
        return await getNSFWUserNovels(id, fullContent, limit);
    }

    const nonR18Result = await getSFWUserNovels(id, fullContent, limit).catch((error) => {
        if (error.name === 'Error') {
            return null;
        }
        throw error;
    });

    if (nonR18Result) {
        return nonR18Result;
    }

    throw new ConfigNotFoundError(
        'This user may not have any novel works, or is an R18 creator, PIXIV_REFRESHTOKEN is required.\npixiv RSS is disabled due to the lack of relevant config.\n該用戶可能沒有小說作品，或者該用戶爲 R18 創作者，需要 PIXIV_REFRESHTOKEN。'
    );
}
