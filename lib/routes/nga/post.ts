import bbobHTML from '@bbob/html';
import { isTagNode } from '@bbob/plugin-helper';
import presetHTML5 from '@bbob/preset-html5';
import type { BBobCoreTagNodeTree, NodeContent, PresetFactory, TagNodeObject } from '@bbob/types';
import { load } from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const attrValue = (node: TagNodeObject) => Object.keys(node.attrs ?? {})[0] ?? '';
const childrenOf = (node: TagNodeObject): NodeContent[] => (Array.isArray(node.content) ? node.content : []);

const customPreset: PresetFactory = presetHTML5.extend((tags) => ({
    ...tags,
    // Basic styles
    dice: (node) => ({ tag: 'b', content: ['ROLL : ', ...childrenOf(node)] }),
    font: (node) => ({ tag: 'span', attrs: { style: `font-family:${attrValue(node)};` }, content: node.content }),
    size: (node) => ({ tag: 'span', attrs: { style: `font-size:${attrValue(node)};` }, content: node.content }),
    align: (node) => ({ tag: 'span', attrs: { style: `text-align:${attrValue(node)};` }, content: node.content }),
    // Images
    img: (node, { render }) => {
        const src = render(node.content ?? []);
        return { tag: 'img', attrs: { src: src.startsWith('.') ? 'https://img.nga.178.com/attachments' + src.slice(1) : src } };
    },
    // Collapsible content
    collapse: (node) => ({ tag: 'details', content: [{ tag: 'summary', content: [attrValue(node)] }, ...childrenOf(node)] }),
    // References
    uid: (node) => ({ tag: 'a', attrs: { href: `https://nga.178.com/nuke.php?func=ucp&uid=${attrValue(node)}` }, content: ['@', ...childrenOf(node)] }),
    tid: (node) => ({ tag: 'a', attrs: { href: `https://nga.178.com/read.php?tid=${attrValue(node)}` }, content: node.content }),
    pid: (node) => {
        const [pid, tid, page] = attrValue(node).split(',', 3);
        return { tag: 'a', attrs: { href: `https://nga.178.com/read.php?tid=${tid}&page=${page}#pid${pid}Anchor` }, content: node.content };
    },
    // Separators
    h: (node) => ({ tag: 'h4', attrs: { style: 'font-size:1.17em;font-weight:bold;border-bottom:1px solid #aaa;clear:both;margin:1.33em 0 0.2em 0;' }, content: node.content }),
}));

const linkMention = (tree: BBobCoreTagNodeTree) =>
    tree.walk((node) => {
        const tag: string | undefined = isTagNode(node) ? node.tag : undefined;
        if (tag?.startsWith('@')) {
            const username = tag.slice(1);
            return { tag: 'a', attrs: { href: `https://nga.178.com/nuke.php?func=ucp&username=${username}` }, content: [`@${username}`] };
        }
        return node;
    });

const formatContent = (str) => bbobHTML(str, [customPreset(), linkMention]);

export const route: Route = {
    path: '/post/:tid/:authorId?',
    categories: ['bbs'],
    example: '/nga/post/18449558',
    parameters: { tid: '帖子 id, 可在帖子 URL 找到', authorId: '作者 id' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '帖子',
    maintainers: ['xyqfer', 'syrinka'],
    handler,
};

type Post = {
    pid: number;
    content: string;
    postdatetimestamp: number;
    author: { uid: number; username: string };
};

type PostResponse = {
    code: number;
    msg: string;
    result: Post[];
    tsubject: string;
    tauthorid: number;
    tauthor: string;
};

async function handler(ctx) {
    const { tid, authorId } = ctx.req.param();
    const timestamp = Math.floor(Date.now() / 1000);
    const cookie = config.nga.uid && config.nga.cid ? `ngaPassportUid=${config.nga.uid}; ngaPassportCid=${config.nga.cid};` : `guestJs=${timestamp};`;
    const { data }: { data: PostResponse } = await got.post('https://ngabbs.com/app_api.php?__lib=post&__act=list', {
        headers: {
            'X-User-Agent': 'NGA_skull/6.0.5(iPhone10,3;iOS 12.0.1)',
            Cookie: cookie,
        },
        form: { tid, ...(authorId && { authorid: authorId }) },
    });
    if (data.code !== 0) {
        throw new Error(`NGA could not load this thread: ${data.msg}`);
    }

    const link = `https://nga.178.com/read.php?tid=${tid}${authorId ? `&authorid=${authorId}` : ''}`;
    const authorName = authorId ? (Number(authorId) === data.tauthorid ? data.tauthor : data.result.find((post) => String(post.author.uid) === authorId)?.author.username) : undefined;
    const items = data.result.map((post) => {
        const description = formatContent(post.content);
        const postId = `postcontent${post.pid}`;
        return {
            title: load(description).text(),
            author: post.author.uid === data.tauthorid ? data.tauthor : post.author.username,
            link: `${link}#${postId}`,
            description,
            pubDate: parseDate(post.postdatetimestamp, 'X'),
            guid: postId,
        };
    });

    return {
        title: authorName ? `NGA ${authorName} ${data.tsubject}` : `NGA ${data.tsubject}`,
        link,
        item: items,
    };
}
