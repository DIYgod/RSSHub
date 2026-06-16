import bbobHTML from '@bbob/html';
import presetHTML5 from '@bbob/preset-html5';
import type { BBobCoreTagNodeTree, NodeContent, PresetFactory, TagNodeObject } from '@bbob/types';
import { load } from 'cheerio';
import iconv from 'iconv-lite';

import { config } from '@/config';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const attrValue = (node: TagNodeObject) => Object.keys(node.attrs ?? {})[0] ?? '';
const childrenOf = (node: TagNodeObject) => node.content as NodeContent[];

const customPreset: PresetFactory = presetHTML5.extend((tags) => ({
    ...tags,
    // 简单样式
    dice: (node) => ({ tag: 'b', content: ['ROLL : ', ...childrenOf(node)] }),
    font: (node) => ({ tag: 'span', attrs: { style: `font-family:${attrValue(node)};` }, content: node.content }),
    size: (node) => ({ tag: 'span', attrs: { style: `font-size:${attrValue(node)};` }, content: node.content }),
    align: (node) => ({ tag: 'span', attrs: { style: `text-align:${attrValue(node)};` }, content: node.content }),
    // 图片
    img: (node, { render }) => {
        const src = render(node.content ?? []);
        return { tag: 'img', attrs: { src: src.startsWith('.') ? 'https://img.nga.178.com/attachments' + src.slice(1) : src }, content: null };
    },
    // 折叠
    collapse: (node) => ({ tag: 'details', content: [{ tag: 'summary', content: [attrValue(node)] }, ...childrenOf(node)] }),
    // 引用
    uid: (node) => ({ tag: 'a', attrs: { href: `https://nga.178.com/nuke.php?func=ucp&uid=${attrValue(node)}` }, content: ['@', ...childrenOf(node)] }),
    tid: (node) => ({ tag: 'a', attrs: { href: `https://nga.178.com/read.php?tid=${attrValue(node)}` }, content: node.content }),
    pid: (node) => {
        const [pid, tid, page] = attrValue(node).split(',');
        return { tag: 'a', attrs: { href: `https://nga.178.com/read.php?tid=${tid}&page=${page}#pid${pid}Anchor` }, content: node.content };
    },
    // 分割线
    h: (node) => ({ tag: 'h4', attrs: { style: 'font-size:1.17em;font-weight:bold;border-bottom:1px solid #aaa;clear:both;margin:1.33em 0 0.2em 0;' }, content: node.content }),
}));

const linkMention = (tree: BBobCoreTagNodeTree) =>
    tree.walk((node) => {
        if (typeof node === 'object' && node !== null && typeof node.tag === 'string' && node.tag.startsWith('@')) {
            const username = node.tag.slice(1);
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

async function handler(ctx) {
    const getPageUrl = (tid, authorId, page = 1, hash = '') => `https://nga.178.com/read.php?tid=${tid}&page=${page}${authorId ? `&authorid=${authorId}` : ''}&rand=${Math.random() * 1000}#${hash}`;
    const getPage = async (tid, authorId, pageId = 1) => {
        const link = getPageUrl(tid, authorId, pageId);
        const timestamp = Math.floor(Date.now() / 1000);
        let cookieString = `guestJs=${timestamp};`;
        if (config.nga.uid && config.nga.cid) {
            cookieString = `ngaPassportUid=${config.nga.uid}; ngaPassportCid=${config.nga.cid};`;
        }
        const response = await got(link, {
            responseType: 'buffer',
            headers: {
                Cookie: cookieString,
            },
        });

        const htmlString = iconv.decode(response.data, 'gbk');
        return load(htmlString);
    };

    const getLastPageId = async (tid, authorId) => {
        const $ = await getPage(tid, authorId);
        const nav = $('#pagebtop');
        const match = nav.html().match(/\{0:'\/read\.php\?tid=(\d)[^']*',1:(\d+),[^}]*\}/);
        return match ? match[2] : 1;
    };

    const tid = ctx.req.param('tid');
    const authorId = ctx.req.param('authorId') || undefined;
    const pageId = await getLastPageId(tid, authorId);

    const $ = await getPage(tid, authorId, pageId);
    const title = $('title').text() || '';
    const posterMap = JSON.parse(
        $('script')
            .text()
            .match(/commonui\.userInfo\.setAll\((.*)\)$/m)[1]
    );
    const authorName = authorId ? posterMap[authorId].username : undefined;

    const items = $('#m_posts_c')
        .children()
        .filter('table')
        .toArray()
        .map((post_) => {
            const post = $(post_);
            const posterId = post
                .find('.posterinfo a')
                .first()
                .attr('href')
                .match(/&uid=(-?\d+)$/)[1];
            const poster = authorName || posterMap[posterId].username;
            const content = post.find('.postcontent').first();
            const description = formatContent(content.html());
            const postId = content.attr('id');
            const link = getPageUrl(tid, authorId, pageId, postId);
            const pubDate = timezone(parseDate(post.find('.postInfo > span').first().text(), 'YYYY-MM-DD HH:mm'), +8);

            return {
                title: load(description).text(),
                author: poster,
                link,
                description,
                pubDate,
                guid: postId,
            };
        });

    const rssTitle = authorName ? `NGA ${authorName} ${title}` : `NGA ${title}`;

    return {
        title: rssTitle,
        link: getPageUrl(tid, authorId, pageId),
        item: items,
    };
}
