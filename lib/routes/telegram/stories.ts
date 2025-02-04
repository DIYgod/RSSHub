import NotFoundError from '@/errors/types/not-found';
import { configureMiddlewares, handleMedia } from '@/routes/telegram/channel-media';
import { Data, DataItem, Route } from '@/types';
import { Context } from 'hono';
import { Api} from 'telegram';
import { getClient, getStory, unwrapMedia } from './tglib/client';
import { getGeoLink, getMediaLink } from './tglib/channel';

export const route: Route = {
    path: '/stories/:username/:story?',
    categories: ['social-media'],
    example: '/stories/telegram',
    parameters: { username: 'entity name', story: 'story' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [],
    name: 'Channel Media',
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
    const {username, story} = ctx.req.param();
    if (!username) {
        throw new NotFoundError();
    }
    const peer = await c.getInputEntity(username);
    if (story) {
        const storyItem = await getStory(peer, Number(story));
        await configureMiddlewares(ctx);
        return await handleMedia(storyItem.media, c, ctx);
    }

    const storiesRes = await c.invoke(new Api.stories.GetPeerStories({peer}));

    const item: DataItem[] = [];
    for (const story of storiesRes.stories.stories) {
        if (!(story instanceof Api.StoryItem)) { // story is deleted (archived) or skipped
            continue;
        }
        const src = `${new URL(ctx.req.url).origin}/telegram/stories/${username}/${story.id}`;
        const pubDate = new Date(story.date * 1000).toUTCString();
        // eslint-disable-next-line no-await-in-loop
        const media = await unwrapMedia(story.media);
        if (!media) { // cannot load the story
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
