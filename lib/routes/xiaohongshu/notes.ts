// @ts-nocheck
import cache from '@/utils/cache';
const { getNotes, formatText, formatNote } = require('./util');

export default async (ctx) => {
    const userId = ctx.req.param('user_id');
    const url = `https://www.xiaohongshu.com/user/profile/${userId}`;

    const { user, notes } = await getNotes(url, cache);

    ctx.set('data', {
        title: `${user.nickname} - 笔记 • 小红书 / RED`,
        description: formatText(user.desc),
        image: user.imageb || user.images,
        link: url,
        item: notes.map((item) => formatNote(url, item)),
    });
};
