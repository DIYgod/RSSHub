import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import { getUser } from './util';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/user/:user_id/:category',
    name: '用户笔记',
    categories: ['social-media', 'popular'],
    view: ViewType.Articles,
    maintainers: ['lotosbin'],
    handler,
    example: '/xiaohongshu/user/593032945e87e77791e03696/notes',
    features: {
        antiCrawler: true,
        requirePuppeteer: true,
    },
    parameters: {
        user_id: 'user id, length 24 characters',
        category: {
            description: 'category, notes or collect',
            options: [
                {
                    value: 'notes',
                    label: 'notes',
                },
                {
                    value: 'collect',
                    label: 'collect',
                },
            ],
        },
    },
};

async function handler(ctx) {
    const userId = ctx.req.param('user_id');
    const category = ctx.req.param('category');
    const url = `https://www.xiaohongshu.com/user/profile/${userId}`;

    const {
        userPageData: { basicInfo, interactions, tags },
        notes,
        collect,
    } = await getUser(url, cache);

    const title = `${basicInfo.nickname} - 小红书${category === 'notes' ? '笔记' : '收藏'}`;
    const description = `${basicInfo.desc} ${tags.map((t) => t.name).join(' ')} ${interactions.map((i) => `${i.count} ${i.name}`).join(' ')}`;
    const image = basicInfo.imageb || basicInfo.images;

    const renderNote = (notes) =>
        notes.flatMap((n) =>
            n.map(({ id, noteCard }) => ({
                title: noteCard.displayTitle,
                link: `${url}/${noteCard.noteId || id}`,
                guid: noteCard.noteId || id || noteCard.displayTitle,
                description: `<img src ="${noteCard.cover.infoList.pop().url}"><br>${noteCard.displayTitle}`,
                author: noteCard.user.nickname,
                upvotes: noteCard.interactInfo.likedCount,
                pubDate: parseDate(new Date().toISOString()),
            }))
        );
    const renderCollect = (collect) => {
        if (!collect) {
            throw new InvalidParameterError('该用户已设置收藏内容不可见');
        }
        if (collect.code !== 0) {
            throw new Error(JSON.stringify(collect));
        }
        if (!collect.data.notes.length) {
            throw new InvalidParameterError('该用户已设置收藏内容不可见');
        }
        return collect.data.notes.map((item) => ({
            title: item.display_title,
            link: `${url}/${item.note_id}`,
            description: `<img src ="${item.cover.info_list.pop().url}"><br>${item.display_title}`,
            author: item.user.nickname,
            upvotes: item.interact_info.likedCount,
            pubDate: parseDate(new Date().toISOString()),
        }));
    };

    return {
        title,
        description,
        image,
        link: url,
        item: category === 'notes' ? renderNote(notes) : renderCollect(collect),
    };
}
