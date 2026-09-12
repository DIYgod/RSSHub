import type { Route } from '@/types';
import { isWorker } from '@/utils/is-worker';
import { parseDate } from '@/utils/parse-date';

import { processImage, withZhihuClient } from './utils';

export const route: Route = {
    path: '/question/:questionId/:sortBy?',
    categories: ['social-media'],
    example: '/zhihu/question/59895982',
    parameters: { questionId: '问题 id', sortBy: '排序方式：`default`, `created`, `updated`。默认为 `default`' },
    features: {
        requireConfig: [
            {
                name: 'ZHIHU_COOKIES',
                description: 'A complete d_c0 and __zse_ck cookie pair skips session initialization. Otherwise Workers use a Playwright browser session; Docker and Vercel generate credentials with JSDOM.',
                optional: true,
            },
        ],
        requirePuppeteer: isWorker || process.env.WORKER_BUILD === 'true',
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.zhihu.com/question/:questionId'],
            target: '/question/:questionId',
        },
    ],
    name: '问题',
    maintainers: ['xyqfer', 'hacklu'],
    handler,
};

function handler(ctx) {
    const {
        questionId,
        sortBy = 'default', // default,created,updated
    } = ctx.req.param();

    // second: get real data from zhihu
    const apiPath = `/api/v4/questions/${questionId}/answers?${new URLSearchParams({
        include:
            'data[*].is_normal,admin_closed_comment,reward_info,is_collapsed,annotation_action,annotation_detail,collapse_reason,is_sticky,collapsed_by,suggest_edit,comment_count,can_comment,content,editable_content,attachment,voteup_count,reshipment_settings,comment_permission,created_time,updated_time,review_info,relevant_info,question,excerpt,is_labeled,paid_info,paid_info_content,relationship.is_authorized,is_author,voting,is_thanked,is_nothelp,is_recognized;data[*].mark_infos[*].url;data[*].author.follower_count,badge[*].topics;data[*].settings.table_of_content.enabled&offset=0',
        limit: '20',
        sort_by: sortBy,
        platform: 'desktop',
    })}`;

    return withZhihuClient(`https://www.zhihu.com/question/${questionId}`, async (client) => {
        const response = await client.get(apiPath);
        const listRes = response.data;

        return {
            title: `知乎-${listRes[0].question.title}`,
            link: `https://www.zhihu.com/question/${questionId}`,
            item: listRes.map((item) => {
                const title = `${item.author.name}的回答：${item.excerpt}`;
                const description = `${item.author.name}的回答<br/><br/>${processImage(item.content)}`;

                return {
                    title,
                    description,
                    author: item.author.name,
                    pubDate: parseDate(item.updated_time * 1000),
                    guid: item.id.toString(),
                    link: `https://www.zhihu.com/question/${questionId}/answer/${item.id}`,
                };
            }),
        };
    });
}
