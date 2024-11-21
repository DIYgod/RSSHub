import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import { getUser } from './util';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { config } from '@/config';

export const route: Route = {
    path: '/user/:user_id/:category',
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
        },
    },
};

async function handler(ctx) {
    const userId = ctx.req.param('user_id');
    const category = ctx.req.param('category');
    const url = `https://www.xiaohongshu.com/user/profile/${userId}`;
    const cookie = config.xiaohongshu.cookie;

    if (cookie && category === 'notes') {
        try {
            const urlNotePrefix = 'https://www.xiaohongshu.com/explore';
            const user = await getUserWithCookie(url, cookie);
            const notes = await renderNotesFulltext(user.notes, urlNotePrefix);
            return {
                title: `${user.userPageData.basicInfo.nickname} - 笔记 • 小红书 / RED`,
                description: user.userPageData.basicInfo.desc,
                image: user.userPageData.basicInfo.imageb || user.userPageData.basicInfo.images,
                link: url,
                item: notes,
            };
        } catch {
            // Fallback to normal logic if cookie method fails
            return await getUserFeedWithoutCookie(url, category);
        }
    } else {
        return await getUserFeedWithoutCookie(url, category);
    }
}

async function getUserFeedWithoutCookie(url: string, category: string) {
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

async function renderNotesFulltext(notes, urlPrex) {
    const data: Array<{
        title: string;
        link: string;
        description: string;
        author: string;
        guid: string;
        pubDate: Date;
    }> = [];
    const promises = notes.flatMap((note) =>
        note.map(async ({ noteCard, id }) => {
            const link = `${urlPrex}/${id}`;
            const { title, description, pubDate } = await getFullNote(link);
            return {
                title,
                link,
                description,
                author: noteCard.user.nickName,
                guid: noteCard.noteId,
                pubDate,
            };
        })
    );
    data.push(...(await Promise.all(promises)));
    return data;
}

async function getFullNote(link) {
    const cookie = config.xiaohongshu.cookie;
    const data = (await cache.tryGet(link, async () => {
        const res = await ofetch(link, {
            headers: cookie
                ? {
                      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                      Cookie: cookie,
                  }
                : {
                      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                  },
        });
        const $ = load(res);
        let script = $('script')
            .filter((i, script) => {
                const text = script.children[0]?.data;
                return text?.startsWith('window.__INITIAL_STATE__=');
            })
            .text();
        script = script.slice('window.__INITIAL_STATE__='.length);
        script = script.replaceAll('undefined', 'null');
        const state = JSON.parse(script);
        const note = state.note.noteDetailMap[state.note.firstNoteId].note;
        const images = note.imageList.map((image) => image.urlDefault);
        const title = note.title;
        let desc = note.desc;
        desc = desc.replaceAll(/\[.*?\]/g, '');
        desc = desc.replaceAll(/#(.*?)#/g, '#$1');
        desc = desc.replaceAll('\n', '<br>');
        const pubDate = new Date(note.time);
        const description = `${images.map((image) => `<img src="${image}">`).join('')}<br>${title}<br>${desc}`;
        return {
            title,
            description,
            pubDate,
        };
    })) as Promise<{ title: string; description: string; pubDate: Date }>;
    return data;
}

async function getUserWithCookie(url: string, cookie: string) {
    const res = await ofetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Cookie: cookie,
        },
    });
    const $ = load(res);
    const paths = $('#userPostedFeeds > section > div > a.cover.ld.mask').map((i, item) => item.attributes[3].value);
    let script = $('script')
        .filter((i, script) => {
            const text = script.children[0]?.data;
            return text?.startsWith('window.__INITIAL_STATE__=');
        })
        .text();
    script = script.slice('window.__INITIAL_STATE__='.length);
    script = script.replaceAll('undefined', 'null');
    const state = JSON.parse(script);
    let index = 0;
    for (const item of state.user.notes.flat()) {
        const path = paths[index];
        if (path && path.includes('?')) {
            item.id = item.id + path?.substring(path.indexOf('?'));
        }
        index = index + 1;
    }
    return state.user;
}
