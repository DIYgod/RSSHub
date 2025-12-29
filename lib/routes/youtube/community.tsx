import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseRelativeDate } from '@/utils/parse-date';

import { isYouTubeChannelId } from './utils';

const renderCommunityDescription = (runs, media) =>
    renderToString(
        <>
            {runs?.length
                ? runs.map((run) => {
                      const url = run?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url;
                      if (url) {
                          return <a href={url.startsWith('https://') ? url : `https://www.youtube.com${url}`}>{run.text}</a>;
                      }
                      return <>{raw((run?.text ?? '').replaceAll('\n', '<br>'))}</>;
                  })
                : null}
            {media?.length ? (
                <>
                    <br />
                    {media.map((item) => (item?.url ? <img src={item.url} /> : null))}
                </>
            ) : null}
        </>
    );

export const route: Route = {
    path: '/community/:handle',
    categories: ['social-media'],
    example: '/youtube/community/@JFlaMusic',
    parameters: { handle: 'YouTube handles or channel id' },
    name: 'Community Posts',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const handle = ctx.req.param('handle');

    let urlPath = handle;
    if (isYouTubeChannelId(handle)) {
        urlPath = `channel/${handle}`;
    }

    const response = await ofetch(`https://www.youtube.com/${urlPath}/posts`);
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
                description: renderCommunityDescription(post.contentText.runs, media),
                link: `https://www.youtube.com/post/${post.postId}`,
                author: post.authorText.runs[0].text,
                pubDate: parseRelativeDate(post.publishedTimeText.runs[0].text.split('(')[0]),
            };
        });

    return {
        title: `${username} - Community Posts- YouTube`,
        link: channelMetadata.channelUrl,
        description: channelMetadata.description,
        item: items,
    };
}
