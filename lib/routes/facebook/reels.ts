import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { baseUrl, fetchCollection, fetchGraphql, renderText, renderVideo } from './utils';

const providerVariables = {
    __relay_internal__pv__FBReels_deprecate_short_form_video_context_gkrelayprovider: false,
    __relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider: true,
    __relay_internal__pv__FBUnifiedVideoMediaContentContainer_comet_video_document_picture_in_picture_gkrelayprovider: false,
    __relay_internal__pv__FBUnifiedVideoMediaContentContainer_enable_chapters_pill_gkrelayprovider: false,
    __relay_internal__pv__ShouldEnableBakedInTextUnifiedVideorelayprovider: false,
    __relay_internal__pv__FBUnifiedVideoCometVideoMedia_comet_photosensitive_content_warning_gkrelayprovider: false,
    __relay_internal__pv__FBUnifiedVideoMediaHeaderControls_enable_chapters_pill_gkrelayprovider: false,
    __relay_internal__pv__FBUnifiedVideoMediaFooter_comet_enable_reels_ads_gkrelayprovider: true,
    __relay_internal__pv__FBUnifiedVideoMediaFooter_organic_ad_cta_on_comet_gkrelayprovider: false,
    __relay_internal__pv__FBUnifiedVideoMediaFooter_enable_meta_ai_pill_gkrelayprovider: false,
    __relay_internal__pv__FBUnifiedVideoMediaFooter_enable_ai_embodiment_chat_pill_gkrelayprovider: false,
    __relay_internal__pv__FBUnifiedVideoMediaFooter_enable_video_augment_pills_gkrelayprovider: false,
    __relay_internal__pv__FBUnifiedVideoPlayerScrubber_fb_comet_vpv_heatmap_gkrelayprovider: false,
    __relay_internal__pv__FBUnifiedVideoDescriptionWithEntities_comet_translations_revamp_sync_caption_with_audio_gkrelayprovider: false,
    __relay_internal__pv__FBUnifiedVideoFeedbackBar_comet_reels_save_button_gkrelayprovider: false,
    __relay_internal__pv__usePushPipEngagementCounts_comet_video_document_picture_in_picture_gkrelayprovider: false,
    __relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider: false,
    __relay_internal__pv__FBUnifiedVideoMenu_fb_reels_ranking_debug_tool_gkrelayprovider: false,
    __relay_internal__pv__CometAudioLanguageUtils_comet_translations_revamp_preferred_languages_gkrelayprovider: false,
};

export const route: Route = {
    path: '/reels/:id',
    categories: ['social-media'],
    example: '/facebook/reels/Microsoft',
    parameters: { id: 'Page or profile username' },
    features: {
        requireConfig: [
            {
                name: 'FACEBOOK_COOKIE',
                optional: true,
                description: 'Facebook cookie, only `c_user` and `xs` are required. Set this if you see `Rate limit exceeded`.',
            },
        ],
        antiCrawler: true,
    },
    radar: [
        {
            source: ['www.facebook.com/:id/reels'],
            target: '/reels/:id',
        },
    ],
    name: 'Reels',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.facebook.com',
};

async function handler(ctx: Context) {
    const { id } = ctx.req.param();
    const collection = await fetchCollection(id, 'reels', 'owner_reels');

    const reels = await fetchGraphql(
        'ProfileCometAppCollectionReelsRendererPaginationQuery',
        '39192928903688955',
        {
            ...providerVariables,
            id: collection.id,
            count: 10,
            renderLocation: null,
            scale: 1,
            useDefaultActor: false,
        },
        getRouteLimit(ctx, 20),
        (lines) => lines[0].data.node.aggregated_fb_shorts.edges.map((edge) => edge.profile_reel_node.node)
    );

    return {
        title: collection.name ?? `Facebook Reels ${id}`,
        link: `${baseUrl}/${id}/reels/`,
        item: reels.map((story): DataItem => {
            const context = story.short_form_video_context;
            return {
                title: story.message?.text?.split('\n', 1)[0] ?? `Reel ${story.post_id}`,
                description: (story.message ? renderText(story.message) : '') + renderVideo(context.playback_video),
                link: context.shareable_url,
                pubDate: parseDate(story.creation_time, 'X'),
                author: context.video_owner?.name,
            };
        }),
    };
}
