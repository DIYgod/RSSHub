import * as cheerio from 'cheerio';
import MarkdownIt from 'markdown-it';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const md = MarkdownIt({
    html: true,
    linkify: true,
});

interface PostAuthor {
    name: string;
    fullname?: string;
    avatarUrl?: string;
}

interface PostContentNode {
    type: string;
    value?: string;
    raw?: string;
}

interface SocialPost {
    slug: string;
    content?: PostContentNode[];
    rawContent?: string;
    author?: PostAuthor;
    publishedAt: string;
    updatedAt?: string;
    url: string;
    numComments?: number;
}

interface UserProfileProps {
    posts?: SocialPost[];
    totalPosts?: number;
}

const getTitle = (raw: string): string => {
    const line = raw
        .split('\n')
        .map((l) => l.trim())
        .find((l) => l && !/^[=#>*\-_]+$/.test(l));
    const plain = (line ?? '')
        .replace(/^#{1,6}\s*/, '')
        .replaceAll(/[*_`~]/g, '')
        .trim();
    return plain || 'Untitled post';
};

export const route: Route = {
    path: '/activity/:user/posts',
    categories: ['programming'],
    view: ViewType.SocialMedia,
    example: '/huggingface/activity/AbstractPhil/posts',
    parameters: {
        user: 'Hugging Face username',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['huggingface.co/:user/activity/posts'],
            target: '/activity/:user/posts',
        },
    ],
    name: 'User Posts Activity',
    maintainers: ['qqc20043'],
    handler,
    url: 'huggingface.co',
    zh: {
        name: '用户帖子动态',
    },
};

async function handler(ctx) {
    const { user } = ctx.req.param();
    const link = `https://huggingface.co/${user}/activity/posts`;

    const html = await ofetch<string>(link, {
        headers: {
            Accept: 'text/html',
        },
    });

    const $ = cheerio.load(html);
    const dataProps = $('[data-target="UserProfile"]').attr('data-props');
    if (!dataProps) {
        throw new Error(`Failed to extract the profile data of "${user}" from the page`);
    }

    const props = JSON.parse(dataProps) as UserProfileProps;
    const posts = props.posts ?? [];

    const items = posts.map((post) => {
        const raw = post.rawContent ?? (post.content ?? []).map((node) => node.value ?? node.raw ?? '').join('');

        return {
            title: getTitle(raw),
            link: new URL(post.url, 'https://huggingface.co').href,
            description: md.render(raw),
            pubDate: parseDate(post.publishedAt),
            guid: post.slug,
            author: post.author?.name ? [{ name: post.author.name, url: `https://huggingface.co/${post.author.name}` }] : undefined,
        };
    });

    return {
        title: `${user} - Posts Activity`,
        link,
        item: items,
    };
}
