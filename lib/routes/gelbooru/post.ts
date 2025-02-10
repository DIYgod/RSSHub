import { Route, ViewType } from '@/types';
import { Context } from 'hono';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import queryString from 'query-string';

export const route: Route = {
    path: '/post/:tags?',
    categories: ['picture'],
    view: ViewType.Pictures,
    example: '/gelbooru/post/1girl rating:general',
    parameters: {
        tags: `要搜索的标签，多个标签用 \` \`（空格）隔开`,
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['gelbooru.com/index.php'],
        },
    ],
    name: 'Gelbooru 标签查询',
    maintainers: ['magicFeirl'],
    description: `
- 默认查询: \`/gelbooru/post\` 功能等同查询 Gelbooru 网站最新的投稿
- 单标签查询: \`/gelbooru/post/1girl\` 查询 \`1girl\` 的最新投稿
- 多标签查询: \`/gelbooru/post/1girl school_uniform rating:general\`
- 更多例子: 请参考 Gelbooru 官方 wiki https://gelbooru.com/index.php?page=wiki&s=&s=view&id=25921

**可选的 URL 参数**
- apiKey & userId: API Access Credentials 如果需要认证，从 https://gelbooru.com/index.php?page=account&s=options 获取
- limit 页面返回数据量，默认 40，可选 1 ~ 100
- imgQuality \`sample\` or \`orig\` 图片质量，默认为 sample

e.g.: \`/gelbooru/post?limit=20&apiKey=xx&userId=xx&imgQuality=orig\`
`,
    handler,
};

function generatePostDescription(post, link, quality: 'sample' | 'orig') {
    const { id, source, owner, file_url: fileUrl, tags, score } = post;
    const isHttp = /^https?:\/\//.test(source);
    const sourceHtml = isHttp ? `<a href=${source}>Source</a>` : `<span>${source}</span>`;
    const sourceHost = isHttp ? new URL(source).host : source;
    const postHtml = `<a href="${link}">#${id}</a>`;
    const uploadByHtml = `Upload by: <a href="https://gelbooru.com/index.php?page=post&s=list&tags=user:${owner}">${owner}</a>`;
    const imgQualityMap = { sample: 'sample_url', orig: 'file_url' };
    const contentURL = post[imgQualityMap[quality]] || fileUrl;

    // 只有两个视频后缀
    const videoExtList = ['mp4', 'webm'];
    const fileExt = fileUrl.slice(fileUrl.lastIndexOf('.') + 1);

    // 默认是图片，但是也考虑视频的情况
    let contentHtml = `<img src="${contentURL}" />`;
    if (videoExtList.includes(fileExt)) {
        contentHtml = `<video controls="true" muted src="${fileUrl}"></video>`;
    }

    return `
        <div>${contentHtml}</div>
        <p></p>
        <h2>Info of ${postHtml}: </h2>
        <p>${sourceHtml}(${sourceHost})</p>
        <p>${uploadByHtml}</p>
        <p>Score: ${score || '-'}</p>
        <p>Tags: <p>${tags}</p></p>
    `;
}

async function handler(ctx: Context) {
    const tags = (decodeURIComponent(ctx.req.param('tags')) || '').trim();
    const { apiKey = '', userId = '', limit = 40, quality = 'sample' }: { apiKey?: string; userId?: string; limit?: number; quality?: 'sample' | 'orig' } = ctx.req.query();

    const response = await got({
        url: 'https://gelbooru.com/index.php',
        searchParams: queryString.stringify({
            page: 'dapi',
            s: 'post',
            q: 'index',
            tags,
            api_key: apiKey,
            user_id: userId,
            limit: limit <= 0 || limit > 100 ? 40 : limit,
            json: 1,
        }),
    });

    const posts = response.data.post;

    return {
        title: tags ? `${tags} - gelbooru.com` : `gelbooru.com post list`,
        link: `https://gelbooru.com/index.php?page=post&s=list&tags=${tags}`,
        icon: 'https://gelbooru.com/favicon.png',
        logo: 'https://gelbooru.com/favicon.png',
        description: 'Gelbooru post list',
        item: posts.map((post) => ({
            title: post.id,
            id: post.id,
            link: `https://gelbooru.com/index.php?page=post&s=view&id=${post.id}`,
            author: post.owner,
            pubDate: parseDate(post.created_at),
            description: generatePostDescription(post, `https://gelbooru.com/index.php?page=post&s=view&id=${post.id}`, quality),
            upvotes: post.score,
            updated: parseDate(post.change),
            media: {
                content: {
                    url: post.file_url,
                },
                thumbnail: {
                    url: post.preview_url,
                },
            },
            category: post.tags.split(/\s+/g),
        })),
    };
}
