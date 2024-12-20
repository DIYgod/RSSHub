import { Route } from '@/types';
import { CreatorData, MediaRelation, PostData } from './types';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import * as cheerio from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import path from 'node:path';
import { getCurrentPath } from '@/utils/helpers';
import { art } from '@/utils/render';
import { config } from '@/config';

const __dirname = getCurrentPath(import.meta.url);

export const route: Route = {
    path: '/:creator',
    categories: ['new-media'],
    example: '/patreon/straightupsisters',
    parameters: { creator: 'Patreon creator id, can be found in the url' },
    features: {
        requireConfig: [
            {
                name: 'PATREON_SESSION_ID',
                optional: true,
                description: 'The value of the session_id cookie after logging in to Patreon, required to access paid posts',
            },
        ],
    },
    radar: [
        {
            source: ['patreon.com/:creator'],
        },
    ],
    name: 'Home',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { creator } = ctx.req.param();

    const baseUrl = 'https://www.patreon.com';
    const link = `${baseUrl}/${creator}`;

    const creatorData = (await cache.tryGet(`patreon:creator:${creator}`, async () => {
        const response = await ofetch(link);

        const $ = cheerio.load(response);
        const nextData = JSON.parse($('#__NEXT_DATA__').text());
        const bootstrapEnvelope = nextData.props.pageProps.bootstrapEnvelope;

        return {
            meta: bootstrapEnvelope.meta,
            id: bootstrapEnvelope.pageBootstrap.campaign.data.id,
            attributes: bootstrapEnvelope.pageBootstrap.campaign.data.attributes,
        };
    })) as CreatorData;

    if (!creatorData.id) {
        throw new Error('Creator not found');
    }

    let headers = {};
    if (config.patreon?.sessionId) {
        headers = {
            Cookie: `session_id=${config.patreon.sessionId}`,
        };
    }

    const posts = await ofetch<PostData>('https://www.patreon.com/api/posts', {
        headers,
        query: {
            include:
                'campaign,access_rules,access_rules.tier.null,attachments_media,audio,audio_preview.null,drop,images,media,native_video_insights,poll.choices,poll.current_user_responses.user,poll.current_user_responses.choice,poll.current_user_responses.poll,user,user_defined_tags,ti_checks,video.null,content_unlock_options.product_variant.null',
            'fields[campaign]': 'currency,show_audio_post_download_links,avatar_photo_url,avatar_photo_image_urls,earnings_visibility,is_nsfw,is_monthly,name,url',
            'fields[post]':
                'change_visibility_at,comment_count,commenter_count,content,created_at,current_user_can_comment,current_user_can_delete,current_user_can_report,current_user_can_view,current_user_comment_disallowed_reason,current_user_has_liked,embed,image,insights_last_updated_at,is_paid,like_count,meta_image_url,min_cents_pledged_to_view,monetization_ineligibility_reason,post_file,post_metadata,published_at,patreon_url,post_type,pledge_url,preview_asset_type,thumbnail,thumbnail_url,teaser_text,title,upgrade_url,url,was_posted_by_campaign_owner,has_ti_violation,moderation_status,post_level_suspension_removal_date,pls_one_liners_by_category,video,video_preview,view_count,content_unlock_options,is_new_to_current_user,watch_state',
            'fields[post_tag]': 'tag_type,value',
            'fields[user]': 'image_url,full_name,url',
            'fields[access_rule]': 'access_rule_type,amount_cents',
            'fields[media]': 'id,image_urls,display,download_url,metadata,file_name',
            'fields[native_video_insights]': 'average_view_duration,average_view_pct,has_preview,id,last_updated_at,num_views,preview_views,video_duration',
            'fields[content-unlock-option]': 'content_unlock_type',
            'fields[product-variant]': 'price_cents,currency_code,checkout_url,is_hidden,published_at_datetime,content_type,orders_count,access_metadata',
            'filter[campaign_id]': creatorData.id,
            'filter[contains_exclusive_posts]': true,
            'filter[is_draft]': false,
            sort: '-published_at',
            'json-api-use-default-includes': false,
            'json-api-version': '1.0',
        },
    });

    const items = posts.data.map(({ attributes, relationships }) => {
        for (const [key, value] of Object.entries(relationships)) {
            if (value.data) {
                relationships[key] = Array.isArray(value.data) ? value.data.map((item) => posts.included.find((i) => i.id === item.id)) : posts.included.find((i) => i.id === value.data.id);
            }
        }
        if (attributes.video_preview) {
            relationships.video_preview = posts.included.find((i) => Number.parseInt(i.id) === attributes.video_preview.media_id) as unknown as MediaRelation;
        }

        return {
            title: attributes.title,
            description: art(path.join(__dirname, 'templates/description.art'), {
                attributes,
                relationships,
                included: posts.included,
            }),
            link: attributes.url,
            pubDate: parseDate(attributes.published_at),
            image: attributes.thumbnail?.url ?? attributes.image.url,
            category: relationships.user_defined_tags?.map((tag) => tag.attributes.value),
        };
    });

    return {
        title: creatorData.meta.title,
        description: creatorData.meta.desc,
        link,
        image: creatorData.attributes.avatar_photo_url,
        item: items,
        allowEmpty: true,
    };
}
