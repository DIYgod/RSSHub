import { Route } from '@/types';
import cache from '@/utils/cache';
import { formatNote, formatText, getNotes } from './util';
import { config } from '@/config';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/user/:user_id/notes/:fulltext',
    radar: [
        {
            source: ['xiaohongshu.com/user/profile/:user_id'],
            target: '/user/:user_id/notes',
        },
    ],
    name: '用户笔记 全文',
    maintainers: ['howerhe'],
    handler,
    example: '/xiaohongshu/user/52d8c541b4c4d60e6c867480/notes/fulltext',
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
        fulltext: {
            description: '是否获取全文',
            default: '',
        },
    },
};

async function handler(ctx) {
    const userId = ctx.req.param('user_id');
    const url = `https://www.xiaohongshu.com/user/profile/${userId}`;
    const cookie = config.xiaohongshu.cookie;
    // 获取详情需要cookie登录
    if (cookie && ctx.req.param('fulltext')) {
        const urlNotePrefix = 'https://www.xiaohongshu.com/explore';
        // 获取用户的笔记信息
        const user = await getUser(url, cookie);
        const notes = await renderNotesFulltext(user.notes, urlNotePrefix);
        return {
            title: `${user.userPageData.basicInfo.nickname} - 笔记 • 小红书 / RED`,
            description: user.userPageData.basicInfo.desc,
            image: user.userPageData.basicInfo.imageb || user.userPageData.basicInfo.images,
            link: url,
            item: notes,
        };
    } else {
        const { user, notes } = await getNotes(url, cache);
        return {
            title: `${user.nickname} - 笔记 • 小红书 / RED`,
            description: formatText(user.desc),
            image: user.imageb || user.images,
            link: url,
            item: notes.map((item) => formatNote(url, item)),
        };
    }
}

/**
 * 获取所有笔记
 * @param notes 用户笔记信息
 * @param urlPrex 笔记详情前缀
 */
async function renderNotesFulltext(notes, urlPrex) {
    const data = [];
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

/**
 * 获取笔记全文
 * @param link
 */
async function getFullNote(link) {
    const cookie = config.xiaohongshu.cookie;
    const data = (await cache.tryGet(link, async () => {
        const res = await got(link, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                Cookie: cookie,
            },
        });
        const $ = load(res.data);
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

/**
 * 获取用户信息和笔记列表信息
 * @param url
 * @param cookie
 */
async function getUser(url: string, cookie: string) {
    const res = await got(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Cookie: cookie,
        },
    });
    const $ = load(res.data);
    // 取出dom里面的信息，防止反爬
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
    // 将 dom里面的随机后缀补到每个文章id后面，防止反爬
    for (const item of state.user.notes.flat()) {
        const path = paths[index];
        if (path && path.includes('?')) {
            item.id = item.id + path?.substring(path.indexOf('?'));
        }
        index = index + 1;
    }
    return state.user;
}
