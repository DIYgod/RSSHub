import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/post/:postid',
    categories: ['bbs'],
    example: '/v2ex/post/584403',
    parameters: { postid: '帖子ID，在 URL 可以找到' },
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
            source: ['v2ex.com/t/:postid'],
        },
    ],
    name: '帖子',
    maintainers: ['kt286'],
    handler,
};

async function handler(ctx) {
    const postid = ctx.req.param('postid');
    const pageUrl = `https://www.v2ex.com/t/${postid}`;

    const { data: topicResponse } = await got('https://www.v2ex.com/api/topics/show.json', {
        searchParams: {
            id: postid,
        },
    });

    const { data: replies } = await got('https://www.v2ex.com/api/replies/show.json', {
        searchParams: {
            topic_id: postid,
        },
    });

    const topic = topicResponse[0];

    return {
        title: `V2EX-${topic.title}`,
        link: pageUrl,
        description: topic.content,
        item: replies.map((item, index) => ({
            title: `#${index + 1} ${item.content}`,
            description: item.content_rendered,
            link: `${pageUrl}#r_${item.id}`,
            author: item.member.username,
            pubDate: parseDate(item.created, 'X'),
        })),
        allowEmpty: true,
    };
}
