import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface Image {
    id: number;
    video?: number;
    urls?: Record<string, { urls: string[] }>;
}

interface Video {
    url: string;
    coverUrls?: string[];
}

interface Post {
    id: number;
    content: string;
    ct: number;
    imgs?: Image[];
    videos?: Record<string, Video>;
    topic?: { topic: string };
}

interface InitialState {
    shareProfile: {
        profileInfo: { name: string; sign: string; avatarUrl: string };
        posts: Post[];
    };
}

const baseUrl = 'https://share.xiaochuankeji.cn';

export const route: Route = {
    path: '/user/:mid',
    name: '用户动态',
    categories: ['social-media'],
    maintainers: ['DIYgod'],
    example: '/zuiyou/user/298793092',
    parameters: {
        mid: '用户 ID，即最右分享主页链接中 `mid` 参数的值。',
    },
    description: '订阅用户公开分享主页首屏中的动态，包括文字、图片和视频。',
    handler,
};

const getImageUrl = (image: Image) => image.urls?.origin?.urls[0] ?? image.urls?.['540']?.urls[0] ?? image.urls?.['360']?.urls[0];

const renderPost = (post: Post) =>
    renderToString(
        <>
            <p>
                {post.content.split('\n').map((line) => (
                    <>
                        {line}
                        <br />
                    </>
                ))}
            </p>
            {post.imgs?.map((image) => {
                const video = post.videos?.[image.id];
                const imageUrl = getImageUrl(image);
                return video ? <video controls src={video.url} poster={video.coverUrls?.[0] ?? imageUrl} /> : imageUrl ? <img src={imageUrl} /> : undefined;
            })}
        </>
    );

async function handler(ctx) {
    const mid = ctx.req.param('mid');
    if (!/^\d+$/.test(mid)) {
        throw new InvalidParameterError('The user ID must be the numeric mid from a Zuiyou profile sharing link.');
    }
    const link = `${baseUrl}/hybrid/share/profile?mid=${mid}`;
    const html = await ofetch(link);
    const $ = load(html);
    const stateScript = $('script')
        .toArray()
        .map((script) => $(script).text())
        .find((script) => script.startsWith('window.APP_INITIAL_STATE='));
    if (!stateScript) {
        throw new Error('Zuiyou did not return the public profile data. Check that the profile sharing link is accessible.');
    }
    const { shareProfile } = JSON.parse(stateScript.replace(/^window\.APP_INITIAL_STATE=/, '').replace(/;\s*$/, '')) as InitialState;
    if (!shareProfile?.profileInfo || !Array.isArray(shareProfile.posts)) {
        throw new Error('Zuiyou did not return a public profile and post list.');
    }
    const { profileInfo, posts } = shareProfile;

    return {
        title: `${profileInfo.name} - 最右`,
        description: profileInfo.sign,
        image: profileInfo.avatarUrl,
        link,
        item: posts.map((post): DataItem => ({
            title: post.content || `动态 ${post.id}`,
            link: `${baseUrl}/hybrid/share/post?pid=${post.id}`,
            guid: String(post.id),
            author: profileInfo.name,
            pubDate: parseDate(post.ct, 'X'),
            description: renderPost(post),
            category: post.topic?.topic ? [post.topic.topic] : undefined,
        })),
    };
}
