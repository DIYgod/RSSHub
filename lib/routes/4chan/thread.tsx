import type { Context } from 'hono';
import { renderToString } from 'hono/jsx/dom/server';
import { FetchError } from 'ofetch';

import NotFoundError from '@/errors/types/not-found';
import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import type { ChanPost } from './utils';
import { parseParams, renderPost } from './utils';

const postTitle = (post: ChanPost, threadId: string, subject?: string) => {
    if (post.sub) {
        return post.sub;
    }
    if (post.resto === 0) {
        return `Thread #${threadId}`;
    }
    return subject ? `Re: ${subject}` : `Post #${post.no}`;
};

const fetchThread = async (board: string, threadId: string): Promise<{ posts: ChanPost[] }> => {
    try {
        const { data } = await got(`https://a.4cdn.org/${board}/thread/${threadId}.json`);
        return data;
    } catch (error) {
        if (error instanceof FetchError && error.statusCode === 404) {
            throw new NotFoundError(`4chan /${board}/ thread ${threadId} was not found; it may have been archived or deleted.`);
        }
        throw error;
    }
};

const handler = async (ctx: Context) => {
    const { board, threadId } = ctx.req.param();
    // Replies are items here, so do not also nest last replies or repeat the reply count in the description.
    const viewOptions = {
        ...parseParams(ctx.req.param('routeParams')),
        includeLastReplies: false,
        includeReplyCount: false,
    };

    const data = await fetchThread(board, threadId);

    const threadUrl = `https://boards.4chan.org/${board}/thread/${threadId}`;
    const op = data.posts.find((post) => post.resto === 0);
    const subject = op?.sub;
    const threadState = [
        op?.sticky ? 'Sticky' : undefined,
        op?.closed ? 'Closed' : undefined,
        op?.bumplimit ? 'Bump limit reached' : undefined,
        op?.imagelimit ? 'Image limit reached' : undefined,
        op?.archived ? 'Archived' : undefined,
    ].filter((state) => state !== undefined);

    const item: DataItem[] = data.posts.map((post) => ({
        author: post.trip ? `${post.name} ${post.trip}` : post.name,
        comments: post.replies,
        description: renderToString(renderPost({ post, board, viewOptions })),
        // Keep the OP entry id distinct from the feed id.
        guid: `${threadUrl}#p${post.no}`,
        link: post.resto === 0 ? threadUrl : `${threadUrl}#p${post.no}`,
        pubDate: parseDate(post.time * 1000),
        title: postTitle(post, threadId, subject),
    }));

    return {
        title: subject ? `4chan's /${board}/ - ${subject}` : `4chan's /${board}/ - Thread #${threadId}`,
        link: threadUrl,
        description: threadState.length > 0 ? threadState.join(' · ') : undefined,
        sortItems: false,
        item,
    };
};

export const route: Route = {
    path: '/:board/thread/:threadId/:routeParams?',
    categories: ['bbs'],
    example: '/4chan/g/thread/110119143',
    parameters: {
        board: '4chan board',
        threadId: 'Thread ID, the number in the thread URL',
        routeParams: 'extra parameters, see the table above',
    },
    features: {
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Thread',
    maintainers: ['Hash6232'],
    radar: [
        {
            source: ['boards.4chan.org/:board/thread/:threadId'],
        },
    ],
    description: `Returns one feed item per post in the thread. The original post links to the thread; replies link to \`#p<post number>\`. The OP's reply count is exposed as \`comments\` in Atom, and thread state such as sticky, closed, bump limit, image limit, and archived is exposed in the feed description.

| Key              | Description                          | Accepts                | Defaults to |
| ---------------- | ------------------------------------ | ---------------------- | ----------- |
| \`revealSpoilers\` | Don't wrap images tagged as spoilers | \`0\`/\`1\`/\`true\`/\`false\` | \`false\`     |`,
    handler,
};
