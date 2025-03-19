import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { art } from '@/utils/render';
import path from 'node:path';
import { parseDate } from '@/utils/parse-date';
import { getCurrentPath } from '@/utils/helpers';
import logger from '@/utils/logger';
const __dirname = getCurrentPath(import.meta.url);

// 游戏id
const GITS_MAP = {
    1: '崩坏三',
    2: '原神',
    3: '崩坏二',
    4: '未定事件簿',
    6: '崩坏：星穹铁道',
    8: '绝区零',
};

// 公告类型
const TYPE_MAP = {
    1: '公告',
    2: '活动',
    3: '资讯',
};

// 游戏缩写
const GAME_SHORT_MAP = {
    1: 'bh3',
    2: 'ys',
    3: 'bh2',
    4: 'wd',
    6: 'sr',
    8: 'zzz',
};
// 游戏官方页所属分区
const OFFICIAL_PAGE_MAP = {
    1: '6',
    2: '28',
    3: '31',
    4: '33',
    6: '53',
    8: '58',
};

class MiHoYoOfficialError extends Error {
    constructor(message) {
        super(message);
        this.name = 'MiHoYoOfficialError';
    }
}

const getNewsList = async ({ gids, type, page_size, last_id }) => {
    const query = new URLSearchParams({
        client_type: '4',
        gids,
        type,
        page_size,
        last_id,
    }).toString();
    const url = `https://bbs-api-static.miyoushe.com/painter/wapi/getNewsList?${query}`;
    const response = await got({
        method: 'get',
        url,
    });
    const list = response?.data?.data?.list;
    return list;
};

const getPostContent = async (row, default_gid = '2') => {
    const post = row.post;
    const post_id = post.post_id;
    const query = new URLSearchParams({
        post_id,
    }).toString();
    const url = `https://bbs-api.miyoushe.com/post/wapi/getPostFull?${query}`;
    return await cache.tryGet(url, async () => {
        const res = await got(url);
        const fullRow = res?.data?.data?.post;
        if (!fullRow) {
            // throw an error to prevent an empty item from being cached and returned
            throw new MiHoYoOfficialError(`mihoyo/bbs/official: getPostContent failed: ${url} - ${JSON.stringify(res)}`);
        }
        // default_gid should be useless since the above error-throwing line, but just in case
        const gid = fullRow?.post?.game_id || default_gid;
        const author = fullRow?.user?.nickname || '';
        const content = fullRow?.post?.content || '';
        const tags = fullRow?.topics?.map((item) => item.name) || [];
        const description = art(path.join(__dirname, '../templates/official.art'), {
            hasCover: post.has_cover,
            coverList: row.cover_list,
            content,
        });
        return {
            // 文章标题
            title: post.subject,
            // 文章链接
            link: `https://www.miyoushe.com/${GAME_SHORT_MAP[gid]}/article/${post_id}`,
            // 文章正文
            description,
            // 文章发布日期
            pubDate: parseDate(post.created_at * 1000),
            // 文章标签
            category: tags,
            author,
        };
    });
};

const getPostContents = (list, default_gid = '2') =>
    Promise.all(
        list.map((item) =>
            getPostContent(item, default_gid).catch((error) => {
                if (error instanceof MiHoYoOfficialError) {
                    logger.error(error.message);
                    return null; // skip it now and pray that it will be available next time
                }
                throw error;
            })
        )
    ).then((items) => items.filter(Boolean));

export const route: Route = {
    path: '/bbs/official/:gids/:type?/:page_size?/:last_id?',
    categories: ['game'],
    example: '/mihoyo/bbs/official/2/3/20/',
    parameters: { gids: '游戏id', type: '公告类型，默认为 2(即 活动)', page_size: '分页大小，默认为 20 ', last_id: '跳过的公告数，例如指定为 40 就是从第 40 条公告开始，可用于分页' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '米游社 - 官方公告',
    maintainers: ['CaoMeiYouRen'],
    handler,
    description: `游戏 id

| 崩坏三 | 原神 | 崩坏二 | 未定事件簿 | 星穹铁道 | 绝区零 |
| ------ | ---- | ------ | ---------- | -------- | ------ |
| 1      | 2    | 3      | 4          | 6        | 8      |

  公告类型

| 公告 | 活动 | 资讯 |
| ---- | ---- | ---- |
| 1    | 2    | 3    |`,
};

async function handler(ctx) {
    const { gids, type = '2', page_size = '20', last_id = '' } = ctx.req.param();

    const list = await getNewsList({ gids, type, page_size, last_id });
    const items = await getPostContents(list, gids);
    const title = `米游社 - ${GITS_MAP[gids] || ''} - ${TYPE_MAP[type] || ''}`;
    const url = `https://www.miyoushe.com/${GAME_SHORT_MAP[gids]}/home/${OFFICIAL_PAGE_MAP[gids]}?type=${type}`;
    const data = {
        title,
        link: url,
        item: items,
    };

    return data;
}
