// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
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

    ctx.set('data', {
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
    });
};
