// @ts-nocheck
import cache from '@/utils/cache';
const { getUser } = require('./util');

export default async (ctx) => {
    const userId = ctx.req.param('user_id');
    const category = ctx.req.param('category');
    const url = `https://www.xiaohongshu.com/user/profile/${userId}`;

    const {
        userPageData: { basicInfo, interactions, tags },
        notes,
        collect,
    } = await getUser(url, cache);

    const title = `${basicInfo.nickname} - ${category === 'notes' ? '笔记' : '收藏'} • 小红书 / RED`;
    const description = `${basicInfo.desc} ${tags.map((t) => t.name).join(' ')} ${interactions.map((i) => `${i.count} ${i.name}`).join(' ')}`;
    const image = basicInfo.imageb || basicInfo.images;

    const renderNote = (notes) =>
        notes.flatMap((n) =>
            n.map(({ noteCard }) => ({
                title: noteCard.displayTitle,
                link: `${url}/${noteCard.noteId}`,
                description: `<img src ="${noteCard.cover.infoList.pop().url}"><br>${noteCard.displayTitle}`,
                author: noteCard.user.nickname,
                upvotes: noteCard.interactInfo.likedCount,
            }))
        );
    const renderCollect = (collect) => {
        if (!collect) {
            throw new Error('该用户已设置收藏内容不可见');
        }
        if (collect.code !== 0) {
            throw new Error(JSON.stringify(collect));
        }
        if (!collect.data.notes.length) {
            throw new Error('该用户已设置收藏内容不可见');
        }
        return collect.data.notes.map((item) => ({
            title: item.display_title,
            link: `${url}/${item.note_id}`,
            description: `<img src ="${item.cover.info_list.pop().url}"><br>${item.display_title}`,
            author: item.user.nickname,
            upvotes: item.interact_info.likedCount,
        }));
    };

    ctx.set('data', {
        title,
        description,
        image,
        link: url,
        item: category === 'notes' ? renderNote(notes) : renderCollect(collect),
    });
};
