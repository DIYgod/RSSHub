import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';

import { baseUrl, gqlFeatures } from './api/web-api/constants';
import { buildGqlMap, resolveQueryIds } from './api/web-api/gql-id-resolver';
import { twitterGot } from './api/web-api/utils';

interface SpaceProfile {
    rest_id: string;
    core: { name: string; screen_name: string };
}

interface SpaceParticipant {
    user_results: { rest_id: string };
}

interface AudioSpace {
    metadata: { rest_id: string; state: string; title?: string; started_at: number };
    participants: { admins: SpaceParticipant[]; speakers: SpaceParticipant[] };
}

interface PresenceResponse {
    users: Record<string, { spaces?: { live_content?: { audiospace?: { id: string } } } }>;
}

const audioSpaceFeatures = {
    ...gqlFeatures.UserTweets,
    spaces_2022_h2_spaces_communities: true,
    spaces_2022_h2_clipping: true,
    profile_label_improvements_pcf_label_in_post_enabled: true,
    responsive_web_profile_redirect_enabled: true,
    rweb_tipjar_consumption_enabled: false,
    premium_content_api_read_enabled: false,
    responsive_web_grok_analyze_button_fetch_trends_enabled: false,
    responsive_web_grok_analyze_post_followups_enabled: true,
    rweb_cashtags_composer_attachment_enabled: true,
    responsive_web_jetfuel_frame: true,
    rweb_sports_post_context_enabled: true,
    responsive_web_grok_share_attachment_enabled: true,
    responsive_web_grok_annotations_enabled: true,
    rweb_conversational_replies_downvote_enabled: false,
    content_disclosure_indicator_enabled: true,
    content_disclosure_ai_generated_indicator_enabled: true,
    responsive_web_grok_show_grok_translated_post: true,
    responsive_web_grok_analysis_button_from_backend: true,
    post_ctas_fetch_enabled: false,
    rweb_cashtags_enabled: true,
    longform_notetweets_inline_media_enabled: false,
    responsive_web_nested_quote_preview_enabled: true,
    responsive_web_grok_image_annotation_enabled: true,
    responsive_web_grok_imagine_annotation_enabled: true,
    responsive_web_grok_community_note_auto_translation_is_enabled: true,
};

export const route: Route = {
    path: '/spaces/:username',
    name: 'Space speaking status',
    categories: ['social-media'],
    example: '/twitter/spaces/_RSSHub',
    parameters: { username: 'The X username, without @.' },
    features: {
        requireConfig: [{ name: 'TWITTER_AUTH_TOKEN', description: 'Please see above for details.' }],
    },
    maintainers: ['DIYgod'],
    description:
        'Reports a user speaking in a live Space, including Spaces hosted by other users. Hosts and co-hosts are also included; listeners are excluded. Each user/Space pair has a stable entry ID and uses the actual Space start time. When the user is not in a live Space, or is in one without speaking, a status entry says so with a fixed ID and no publication date. This does not join or listen to a Space.',
    radar: [{ source: ['x.com/:username'], target: '/spaces/:username' }],
    handler,
};

function participantMatches(participant: SpaceParticipant, user: SpaceProfile) {
    return participant.user_results.rest_id === user.rest_id;
}

function buildSpaceFeed(user: SpaceProfile, space?: AudioSpace): Data {
    const { name, screen_name: username } = user.core;
    const link = `https://x.com/${username}`;
    const data: Data = {
        title: `${username} - Space speaking status`,
        link,
        item: [{ title: `${name} is not ${space ? 'speaking ' : ''}in a live Space`, link, author: name, guid: `${user.rest_id}:spaces:inactive` }],
    };
    if (space?.metadata.state !== 'Running') {
        return data;
    }
    const host = space.participants.admins.some((participant) => participantMatches(participant, user));
    const speaker = space.participants.speakers.some((participant) => participantMatches(participant, user));
    if (!host && !speaker) {
        return data;
    }
    const metadata = space.metadata;
    data.item = [
        {
            title: `${name} is ${host ? 'hosting' : 'speaking in'} ${metadata.title || 'a live Space'}`,
            link: `https://x.com/i/spaces/${metadata.rest_id}`,
            author: name,
            guid: `${user.rest_id}:spaces:${metadata.rest_id}`,
            pubDate: parseDate(metadata.started_at, 'x'),
            category: [host ? 'host' : 'speaker'],
        },
    ];
    return data;
}

async function handler(ctx: Context): Promise<Data> {
    const username = ctx.req.param('username') ?? '';
    if (!/^\w{1,15}$/.test(username)) {
        throw new InvalidParameterError('Use a valid X username without @.');
    }
    const operations = buildGqlMap(await resolveQueryIds());
    const user = await cache.tryGet<SpaceProfile>(`twitter:spaces:profile:${username}`, async () => {
        const response = (await twitterGot(`${baseUrl}${operations.UserByScreenName}`, {
            variables: JSON.stringify({ screen_name: username, withSafetyModeUserFields: true }),
            features: JSON.stringify(gqlFeatures.UserByScreenName),
            fieldToggles: JSON.stringify({ withAuxiliaryUserLabels: false }),
        })) as { data?: { user?: { result?: SpaceProfile } } };
        const result = response.data?.user?.result;
        if (!result) {
            throw new Error('X did not return this user. Check the username and authorized session.');
        }
        return result;
    });
    const presence = (await twitterGot(`${baseUrl}/fleets/v1/avatar_content`, { user_ids: user.rest_id })) as PresenceResponse;
    const currentSpace = presence.users[user.rest_id]?.spaces?.live_content?.audiospace;
    if (!currentSpace) {
        return buildSpaceFeed(user);
    }
    const response = (await twitterGot(`${baseUrl}${operations.AudioSpaceById}`, {
        variables: JSON.stringify({ id: currentSpace.id, isMetatagsQuery: false, withReplays: true, withListeners: false }),
        features: JSON.stringify(audioSpaceFeatures),
    })) as { data?: { audioSpace?: AudioSpace } };
    const space = response.data?.audioSpace;
    if (!space) {
        throw new Error('X did not return metadata for the current Space.');
    }
    return buildSpaceFeed(user, space);
}
