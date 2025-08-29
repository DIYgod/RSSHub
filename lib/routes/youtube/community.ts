import { Route } from '@/types';

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseRelativeDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import { isYouTubeChannelId } from './utils';

export const route: Route = {
    path: '/community/:handle',
    categories: ['social-media'],
    example: '/youtube/community/@JFlaMusic',
    parameters: { handle: 'YouTube handles or channel id' },
    name: 'Community',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const handle = ctx.req.param('handle');

    let urlPath = handle;
    if (isYouTubeChannelId(handle)) {
        urlPath = `channel/${handle}`;
    }

    const { data: response } = await got(`https://www.youtube.com/${urlPath}/community`);
    const $ = load(response);
    const ytInitialData = JSON.parse(
        $('script')
            .text()
            .match(/ytInitialData = ({.*?});/)?.[1] ?? '{}'
    );

    const channelMetadata = ytInitialData.metadata.channelMetadataRenderer;
    const username = channelMetadata.title;
    const communityTab = ytInitialData.contents.twoColumnBrowseResultsRenderer.tabs.find(
        (tab) => tab.tabRenderer.endpoint.commandMetadata.webCommandMetadata.url.endsWith('/posts') || tab.tabRenderer.endpoint.commandMetadata.webCommandMetadata.url.endsWith('/community')
    );
    const list = communityTab.tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents;

    if (list[0].messageRenderer) {
        throw new Error(list[0].messageRenderer.text.runs[0].text);
    }

    const items = list
        .filter((i) => i.backstagePostThreadRenderer)
        .map((item) => {
            const post = item.backstagePostThreadRenderer.post.backstagePostRenderer || item.backstagePostThreadRenderer.post.sharedPostRenderer.originalPost.backstagePostRenderer;
            const media = post.backstageAttachment?.postMultiImageRenderer?.images.map((i) => i.backstageImageRenderer.image.thumbnails.pop()) ?? [post.backstageAttachment?.backstageImageRenderer?.image.thumbnails.pop()];
            return {
                title: post.contentText.runs?.[0].text ?? '',
                description: art(path.join(__dirname, 'templates/community.art'), {
                    runs: post.contentText.runs,
                    media,
                }),
                link: `https://www.youtube.com/post/${post.postId}`,
                author: post.authorText.runs[0].text,
                pubDate: parseRelativeDate(post.publishedTimeText.runs[0].text.split('(')[0]),
            };
        });

    return {
        title: `${username} - Community - YouTube`,
        link: channelMetadata.channelUrl,
        description: channelMetadata.description,
        item: items,
    };
}
