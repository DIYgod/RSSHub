import cache from '@/utils/cache';
import { Innertube } from 'youtubei.js';
import utils, { getVideoUrl } from '../utils';
import { Data } from '@/types';

const innertubePromise = Innertube.create();

export const getChannelIdByUsername = (username: string) =>
    cache.tryGet(`youtube:getChannelIdByUsername:${username}`, async () => {
        const innertube = await innertubePromise;
        const navigationEndpoint = await innertube.resolveURL(`https://www.youtube.com/${username}`);
        return navigationEndpoint.payload.browseId;
    });

export const getDataByUsername = async ({ username, embed, filterShorts }: { username: string; embed: boolean; filterShorts: boolean }): Promise<Data> => {
    const channelId = (await getChannelIdByUsername(username)) as string;
    return getDataByChannelId({ channelId, embed, filterShorts });
};

export const getDataByChannelId = async ({ channelId, embed }: { channelId: string; embed: boolean; filterShorts: boolean }): Promise<Data> => {
    const innertube = await innertubePromise;
    const channel = await innertube.getChannel(channelId);
    const videos = await channel.getVideos();

    return {
        title: `${channel.metadata.title || channelId} - YouTube`,
        link: `https://www.youtube.com/channel/${channelId}`,
        image: channel.metadata.avatar?.[0].url,
        description: channel.metadata.description,

        item: videos.videos
            .filter((video) => 'video_id' in video)
            .map((video) => {
                const img = 'thumbnail' in video ? video.thumbnail?.[0].url : undefined;

                return {
                    title: video.title.text || `YouTube Video ${video.video_id}`,
                    description: 'description_snippet' in video ? utils.renderDescription(embed, video.video_id, img, utils.formatDescription(video.description_snippet?.toHTML())) : null,
                    link: `https://www.youtube.com/watch?v=${video.video_id}`,
                    author: typeof video.author === 'string' ? video.author : (video.author.name === 'N/A' ? undefined : video.author.name),
                    image: img,
                    attachments: [
                        {
                            url: getVideoUrl(video.video_id),
                            mime_type: 'text/html',
                        },
                    ],
                };
            }),
    };
};
