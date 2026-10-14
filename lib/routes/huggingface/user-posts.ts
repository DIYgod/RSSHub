import MarkdownIt from 'markdown-it';

import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const md = MarkdownIt({ breaks: true, linkify: true });

interface SocialPost {
    rawContent: string;
    url: string;
    publishedAt: string;
    author: {
        name: string;
        fullname?: string;
    };
    attachments?: Array<{
        type: string;
        url: string;
    }>;
}

interface Activity {
    type: string;
    socialPost?: SocialPost;
}

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
        antiCrawler: false,
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
    maintainers: ['qqc20043', 'pseudoyu'],
    handler,
    url: 'huggingface.co',
};

async function handler(ctx) {
    const { user } = ctx.req.param();
    const link = `https://huggingface.co/${user}/activity/posts`;

    const { recentActivity } = await ofetch<{ recentActivity: Activity[] }>('https://huggingface.co/api/recent-activity', {
        query: {
            feedType: 'user',
            entity: user,
            activityType: 'post',
            limit: 100,
        },
    });

    // The post activity also lists the user's comments and reactions on other posts
    const items: DataItem[] = recentActivity
        .flatMap((activity) => (activity.type === 'social-post' && activity.socialPost ? [activity.socialPost] : []))
        .map((post) => ({
            title: post.rawContent.trim().split('\n', 1)[0],
            description:
                md.render(post.rawContent) +
                (post.attachments ?? [])
                    .filter((attachment) => attachment.type === 'image' || attachment.type === 'video')
                    .map((attachment) => (attachment.type === 'video' ? `<video controls src="${attachment.url}"></video>` : `<img src="${attachment.url}">`))
                    .join(''),
            link: `https://huggingface.co${post.url}`,
            pubDate: parseDate(post.publishedAt),
            author: post.author.fullname || post.author.name,
        }));

    return {
        title: `${user} - Posts Activity`,
        link,
        item: items,
    };
}
