import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import querystring from 'querystring';
import { getUser, renderNotesFulltext, getUserWithCookie } from './util';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import { config } from '@/config';
import { fallback, queryToBoolean } from '@/utils/readable-social';
export const route: Route = {
    path: '/user/:user_id/:category/:routeParams?',
    name: '用户笔记/收藏',
    categories: ['social-media', 'popular'],
    view: ViewType.Articles,
    maintainers: ['lotosbin', 'howerhe', 'rien7', 'dddaniel1', 'pseudoyu'],
    handler,
    radar: [
        {
            source: ['xiaohongshu.com/user/profile/:user_id'],
            target: '/user/:user_id/notes',
        },
    ],
    example: '/xiaohongshu/user/593032945e87e77791e03696/notes',
    features: {
        antiCrawler: true,
        requirePuppeteer: true,
        requireConfig: [
            {
                name: 'XIAOHONGSHU_COOKIE',
                optional: true,
                description: '小红书 cookie 值，可在网络里面看到。',
            },
        ],
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
            default: 'notes',
        },
        routeParams: {
            description: 'displayLivePhoto,`/user/:user_id/notes/displayLivePhoto=0`,不限时LivePhoto显示为图片,`/user/:user_id/notes/displayLivePhoto=1`,取值不为0时LivePhoto显示为视频',
            default: '0',
        },
    },
};

async function handler(ctx) {
    const userId = ctx.req.param('user_id');
    const category = ctx.req.param('category');
    const routeParams = querystring.parse(ctx.req.param('routeParams'));
    const displayLivePhoto = !!fallback(undefined, queryToBoolean(routeParams.displayLivePhoto), false);
    const url = `https://www.xiaohongshu.com/user/profile/${userId}`;
    const cookie = config.xiaohongshu.cookie;

    if (cookie && category === 'notes') {
        try {
            const urlNotePrefix = 'https://www.xiaohongshu.com/explore';
            const user = await getUserWithCookie(url, cookie);
            const notes = await renderNotesFulltext(user.notes, urlNotePrefix, displayLivePhoto);
            return {
                title: `${user.userPageData.basicInfo.nickname} - 笔记 • 小红书 / RED`,
                description: user.userPageData.basicInfo.desc,
                image: user.userPageData.basicInfo.imageb || user.userPageData.basicInfo.images,
                link: url,
                item: notes,
            };
        } catch {
            // Fallback to normal logic if cookie method fails
            return await getUserFeeds(url, category);
        }
    } else {
        return await getUserFeeds(url, category);
    }
}

async function getUserFeeds(url: string, category: string) {
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
