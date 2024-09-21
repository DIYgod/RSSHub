import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { art } from '@/utils/render';
import path from 'node:path';
import { parseDate } from '@/utils/parse-date';

const renderDescription = (description, images) => art(path.join(__dirname, '../templates/description.art'), { description, images });

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
