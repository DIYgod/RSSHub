import { randomBytes } from 'node:crypto';

import { config } from '@/config';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const baseUrl = 'https://www.facebook.com';

const providerVariables = {
    __relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider: false,
    __relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider: false,
    __relay_internal__pv__CometFeedStory_enable_reactor_facepilerelayprovider: false,
    __relay_internal__pv__CometFeedStory_enable_social_bubblesrelayprovider: false,
    __relay_internal__pv__CometFeedStory_enable_post_permalink_white_space_clickrelayprovider: false,
    __relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider: false,
    __relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider: false,
    __relay_internal__pv__IsWorkUserrelayprovider: false,
    __relay_internal__pv__TestPilotShouldIncludeDemoAdUseCaserelayprovider: false,
    __relay_internal__pv__FBReels_deprecate_short_form_video_context_gkrelayprovider: false,
    __relay_internal__pv__CometUFI_dedicated_comment_routable_dialog_gkrelayprovider: true,
    __relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider: false,
    __relay_internal__pv__CometFeedShareMedia_shouldPrefetchShareImagerelayprovider: false,
    __relay_internal__pv__CometImmersivePhotoCanUserDisable3DMotionrelayprovider: false,
    __relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider: false,
    __relay_internal__pv__IsMergQAPollsrelayprovider: false,
    __relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider: true,
    __relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider: false,
    __relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider: 'AUTO_TRANSLATE',
    __relay_internal__pv__CometUFIShareActionMigrationrelayprovider: true,
    __relay_internal__pv__CometUFISingleLineUFIrelayprovider: false,
    __relay_internal__pv__relay_provider_comet_ufi_ssr_seo_deferrelayprovider: true,
    __relay_internal__pv__FBReelsIFUTileContent_reelsIFUPlayOnHoverrelayprovider: false,
    __relay_internal__pv__GroupsCometGYSJFeedItemHeightrelayprovider: 150,
    __relay_internal__pv__StoriesShouldEnablePhotosensitiveContentWarningrelayprovider: false,
    __relay_internal__pv__ShouldEnableBakedInTextStoriesrelayprovider: false,
    __relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider: false,
};

const collectStories = (value: any, stories: any[]) => {
    if (!value || typeof value !== 'object') {
        return;
    }
    if (value.__typename === 'Story') {
        stories.push(value);
        return;
    }
    for (const child of Object.values(value)) {
        collectStories(child, stories);
    }
};

const findPageInfo = (value: any): { has_next_page: boolean; end_cursor: string } | undefined => {
    if (!value || typeof value !== 'object') {
        return;
    }
    if (value.page_info) {
        return value.page_info;
    }
    for (const child of Object.values(value)) {
        const found = findPageInfo(child);
        if (found) {
            return found;
        }
    }
};

const renderImage = (media: any) => {
    const image = media?.photo_image?.uri ?? media?.image?.uri ?? media?.large_share_image?.uri;
    return image ? `<img src="${image}" alt="${media.accessibility_caption ?? ''}">` : '';
};

const renderVideo = (video: any) => `<video controls poster="${video.preferred_thumbnail?.image.uri}" src="${video.videoDeliveryLegacyFields.browser_native_hd_url ?? video.videoDeliveryLegacyFields.browser_native_sd_url}"></video>`;

const renderAttachment = (attachment: any): string => {
    if (attachment.all_subattachments) {
        return attachment.all_subattachments.nodes.map((node: any) => renderAttachment(node)).join('');
    }
    if (attachment.target) {
        const { target } = attachment;
        const cover = target.comet_cover_media_renderer;
        const coverHtml = cover?.cover_video ? renderVideo(cover.cover_video) : renderImage(cover?.cover_photo?.photo);
        const details = [target.capitalized_day_time_sentence, target.event_place?.contextual_name, attachment.description?.text].filter(Boolean).join('<br>');
        return `<p><a href="${target.url}">${target.name}</a>${details ? `<br>${details}` : ''}</p>${coverHtml}`;
    }
    const media = attachment.media;
    if (media?.__typename === 'Video') {
        return renderVideo(media.video_grid_renderer?.video ?? media);
    }
    const img = renderImage(media);
    const link = attachment.story_attachment_link_renderer?.attachment.web_link.url;
    return link ? `<p><a href="${link}">${img}<br>${attachment.title_with_entities?.text ?? ''}</a></p>` : img;
};

const renderText = (message: any) => {
    const chars = [...message.text];
    let html = '';
    let position = 0;
    const ranges = message.ranges.toSorted((a: any, b: any) => a.offset - b.offset);
    for (const range of ranges) {
        const url = range.entity?.external_url ?? range.entity?.url;
        if (!url || range.offset < position) {
            continue;
        }
        html += chars.slice(position, range.offset).join('') + `<a href="${url}">${chars.slice(range.offset, range.offset + range.length).join('')}</a>`;
        position = range.offset + range.length;
    }
    return `<p>${(html + chars.slice(position).join('')).replaceAll('\n', '<br>')}</p>`;
};

const renderStory = (story: any) => {
    const message = story.comet_sections.message?.story.message;
    const attachments = story.attachments.map((attachment: any) => renderAttachment(attachment.styles.attachment)).join('');
    return { text: message?.text as string | undefined, html: (message ? renderText(message) : '') + attachments };
};

export const fetchStories = async (friendlyName: string, docId: string, variables: Record<string, unknown>, limit: number) => {
    const lsd = randomBytes(16).toString('base64url');
    const jazoest = `2${[...lsd].reduce((sum, char) => sum + char.codePointAt(0)!, 0)}`;

    const { cookie } = config.facebook;
    const dtsg = cookie
        ? await cache.tryGet(
              'facebook:dtsg',
              async () => {
                  const text = await ofetch(`${baseUrl}/ajax/dtsg/`, { query: { __a: 1 }, headers: { cookie }, responseType: 'text' });
                  return JSON.parse(text.replace('for (;;);', '')).payload.token as string;
              },
              86400,
              false
          )
        : undefined;

    const stories: any[] = [];
    let pageInfo = { has_next_page: true, end_cursor: null as string | null };
    while (pageInfo.has_next_page && stories.length < limit) {
        // oxlint-disable-next-line no-await-in-loop - depends on previous response for cursor
        const text = (await cache.tryGet(
            `facebook:${friendlyName}:${variables.id}:${pageInfo.end_cursor ?? ''}`,
            () =>
                ofetch(`${baseUrl}/api/graphql/`, {
                    method: 'POST',
                    headers: { 'x-fb-lsd': lsd, 'accept-language': 'en-US', ...(cookie && { cookie }) },
                    body: new URLSearchParams({
                        lsd,
                        jazoest,
                        ...(dtsg && { fb_dtsg: dtsg }),
                        fb_api_req_friendly_name: friendlyName,
                        variables: JSON.stringify({
                            ...providerVariables,
                            ...variables,
                            count: 3,
                            cursor: pageInfo.end_cursor,
                            scale: 1,
                            useDefaultActor: false,
                        }),
                        doc_id: docId,
                    }),
                }),
            pageInfo.end_cursor ? config.cache.contentExpire : config.cache.routeExpire,
            !!pageInfo.end_cursor
        )) as string;

        const lines = text.split('\n');
        let next;
        for (const line of lines) {
            const data = JSON.parse(line);
            collectStories(data, stories);
            next ??= findPageInfo(data);
        }
        if (!next) {
            throw new Error(`Facebook GraphQL failed: ${JSON.parse(lines[0]).errors?.[0]?.message ?? text}`);
        }
        pageInfo = next;
    }
    return stories;
};

export const storiesToItems = (stories: any[]) =>
    stories.map((node): DataItem => {
        const story = node.comet_sections.content.story;
        const own = renderStory(story);
        const shared = story.attached_story ? renderStory(story.attached_story) : undefined;
        return {
            title: (own.text ?? shared?.text)?.split('\n', 1)[0] ?? node.actors[0].name,
            description: own.html + (shared?.html ?? ''),
            link: node.permalink_url,
            pubDate: parseDate(node.creation_time, 'X'),
            author: node.actors[0].name,
        };
    });
