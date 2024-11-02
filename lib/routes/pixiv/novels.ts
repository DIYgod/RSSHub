import { Data, Route, ViewType } from '@/types';
import { fallback, queryToBoolean } from '@/utils/readable-social';
import { getR18Novels } from './api/get-novels-nsfw';
import { getNonR18Novels } from './api/get-novels-sfw';
import { config } from '@/config';

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
    },
    radar: [
        {
            title: 'User Novels (簡介 Basic info)',
            source: ['www.pixiv.net/users/:id/novels'],
            target: '/user/novels/:id',
        },
        {
            title: 'User Novels (全文 Full text)',
            source: ['www.pixiv.net/users/:id/novels'],
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

    // Use R18 API first if auth exists
    if (hasPixivAuth()) {
        return await getR18Novels(id, fullContent, limit);
    }

    // Attempt non-R18 API when Pixiv auth is missing
    const nonR18Result = await getNonR18Novels(id, fullContent, limit).catch(() => null);
    if (nonR18Result) {
        return nonR18Result;
    }

    // Fallback to R18 API as last resort
    return await getR18Novels(id, fullContent, limit);
}
