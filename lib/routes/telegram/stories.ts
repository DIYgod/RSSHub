/* eslint-disable no-await-in-loop */
import NotFoundError from '@/errors/types/not-found';
import { configureMiddlewares, handleMedia } from '@/routes/telegram/channel-media';
import { Data, DataItem, Route } from '@/types';
import { Context } from 'hono';
import { Api } from 'telegram';
import { getClient, getStory, unwrapMedia } from './tglib/client';
import { getGeoLink, getMediaLink } from './tglib/channel';

export const route: Route = {
    path: '/stories/:username/:story?',
    categories: ['social-media'],
    example: '/telegram/stories/telegram',
    parameters: { username: 'entity name', story: 'story' },
    features: {
        requireConfig: [
            {
                name: 'TELEGRAM_SESSION',
                optional: false,
                description: 'Telegram API Authentication',
            },
            {
                name: 'TELEGRAM_API_ID',
                optional: true,
                description: 'Telegram API ID',
            },
            {
                name: 'TELEGRAM_API_HASH',
                optional: true,
                description: 'Telegram API Hash',
            },
            {
                name: 'TELEGRAM_MAX_CONCURRENT_DOWNLOADS',
                optional: true,
                description: 'Telegram Max Concurrent Downloads',
            },
            {
                name: 'TELEGRAM_PROXY_HOST',
                optional: true,
                description: 'Telegram Proxy Host',
            },
            {
                name: 'TELEGRAM_PROXY_PORT',
                optional: true,
                description: 'Telegram Proxy Port',
            },
            {
                name: 'TELEGRAM_PROXY_SECRET',
                optional: true,
                description: 'Telegram Proxy Secret',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [],
    name: 'Stories',
    maintainers: ['synchrone'],
    handler,
    description: ``,
};

function getMediaAreas(mediaAreas?: Api.TypeMediaArea[]) {
    let description = '';
    for (const area of mediaAreas ?? []) {
        if (area instanceof Api.MediaAreaChannelPost) {
            // TODO: fetch area.msgId and display inline
        } else if ((area instanceof Api.MediaAreaGeoPoint || area instanceof Api.MediaAreaVenue) && area.geo instanceof Api.GeoPoint) {
            description += getGeoLink(area.geo);
        } else if (area instanceof Api.MediaAreaSuggestedReaction) {
            if (area.reaction instanceof Api.ReactionEmoji) {
                description += area.reaction.emoticon;
            } else if (area.reaction instanceof Api.ReactionCustomEmoji) {
                // TODO: fetch area.reaction.documentId and display inline
            }
        }
    }
    return description;
}

export default async function handler(ctx: Context) {
    const c = await getClient();
    const { username, story } = ctx.req.param();
    if (!username) {
        throw new NotFoundError();
    }
    const peer = await c.getInputEntity(username);
    if (story) {
        const storyItem = await getStory(peer, Number(story));
        await configureMiddlewares(ctx);
        return await handleMedia(storyItem.media, c, ctx);
    }

    const storiesRes = await c.invoke(new Api.stories.GetPeerStories({ peer }));

    const item: DataItem[] = [];
    for (const story of storiesRes.stories.stories) {
        if (!(story instanceof Api.StoryItem)) {
            // story is deleted (archived) or skipped
            continue;
        }
        const src = `${new URL(ctx.req.url).origin}/telegram/stories/${username}/${story.id}`;
        const pubDate = new Date(story.date * 1000).toUTCString();
        const media = await unwrapMedia(story.media);
        if (!media) {
            // cannot load the story
            continue;
        }

        const description = getMediaLink(src, media) + getMediaAreas(story.mediaAreas);
        item.push({
            title: story.caption ?? pubDate,
            description,
            pubDate,
            link: `https://t.me/${username}/s/${story.id}`,
            author: username,
        });
    }

    return {
        title: `Stories of @${username}`,
        link: `https://t.me/${username}`,
        item,
        allowEmpty: ctx.req.param('id') === 'allow_empty',
        description: `Stories of @${username} on Telegram`,
    } as Data;
}
