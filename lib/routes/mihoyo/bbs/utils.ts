import { parseDate } from '@/utils/parse-date';

import { renderDescription } from '../templates/description';

const post2item = (e) => {
    const author = e.user.nickname;
    const title = e.post.subject;
    const link = `https://www.miyoushe.com/ys/article/${e.post.post_id}`;
    let describe = e.post.content || '';
    try {
        describe = JSON.parse(e.post.content).describe;
    } catch (error) {
        if (!(error instanceof SyntaxError)) {
            throw error;
        }
    }
    const description = renderDescription(describe || '', [...new Set([e.post.cover, ...e.post.images])].filter(Boolean));
    const pubDate = parseDate(e.post.created_at * 1000);
    const upvotes = e.stat.like_num;
    const comments = e.stat.reply_num;
    return {
        author,
        title,
        link,
        description,
        pubDate,
        upvotes,
        comments,
    };
};

export { post2item };
