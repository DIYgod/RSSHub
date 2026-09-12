import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export async function fetchThreads(kind?: 'forum' | 'topic' | 'user', id?: string) {
    const rootUrl = 'https://forums.liyuans.com';
    const query = ['initial_post=1', 'order_by=create_time'];

    let link = `${rootUrl}/recent`;

    if (id) {
        if (Number.isNaN(Number(id))) {
            query.push(`${kind}_ids=${encodeURIComponent(id)}`);
            link = rootUrl;
        } else {
            query.push(`${kind}_id=${encodeURIComponent(id)}`);
            link = `${rootUrl}/${kind}/${id}`;
        }
    }

    const response = await ofetch(`https://api.forums.liyuans.com/threads?${query.join('&')}`);

    const data = response.data.results;

    return {
        title: '梨园',
        link,
        description: '最新帖子 - 梨园',
        allowEmpty: true,
        item: data.map((item) => {
            const category = [...new Set([item.forum.name, item.topic?.name, ...item.tags].filter(Boolean))];

            return {
                title: item.title,
                author: item.user.nickname,
                category,
                description: `@${item.user.username}: ${item.initial_post.thumb}`,
                pubDate: parseDate(item.create_time, 'X'),
                guid: `Thread_${item.id}`,
                link: `${rootUrl}/thread/${item.id}`,
            };
        }),
    };
}
