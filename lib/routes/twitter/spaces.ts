import type { Context } from 'hono';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';

import { baseUrl, gqlFeatures } from './api/web-api/constants';
import { buildGqlMap, resolveQueryIds } from './api/web-api/gql-id-resolver';
import { twitterGot } from './api/web-api/utils';

interface ApiErrors {
    errors?: Array<{ code?: number }>;
}

export interface SpaceProfile {
    rest_id: string;
    core?: { name?: string; screen_name?: string };
    legacy?: { name?: string; screen_name?: string };
}

interface SpaceParticipant {
    twitter_screen_name?: string;
    user_results?: { rest_id?: string; result?: { rest_id?: string } };
}

export interface AudioSpace {
    metadata: { rest_id: string; state: string; title?: string; started_at?: number };
    participants: { admins: SpaceParticipant[]; speakers: SpaceParticipant[] };
}

interface PresenceResponse extends ApiErrors {
    users: Record<string, { spaces?: { live_content?: { audiospace?: { id?: string; state?: string } } } }>;
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
        requireConfig: [{ name: 'TWITTER_AUTH_TOKEN', description: 'An authorized login session for the X web API. Developer API keys and third-party timeline providers are not used by this route.' }],
    },
    maintainers: ['DIYgod'],
    description:
        'Reports a user speaking in a live Space, including Spaces hosted by other users. Hosts and co-hosts are also included; listeners are excluded. Each user/Space pair has a stable entry ID and uses the actual Space start time. When the user is not speaking in a live Space, a status entry has a fixed ID and no publication date. This does not join or listen to a Space. Requires your own authorized TWITTER_AUTH_TOKEN on a self-hosted instance.',
    radar: [{ source: ['x.com/:username'], target: '/spaces/:username' }],
    handler,
};

function checkErrors(response: ApiErrors, operation: string) {
    if (response.errors !== undefined && (!Array.isArray(response.errors) || response.errors.length)) {
        throw new Error(`X ${operation} failed. Check the TWITTER_AUTH_TOKEN authorization and X API access.`);
    }
}

function participantMatches(participant: SpaceParticipant, user: SpaceProfile) {
    const restId = participant.user_results?.rest_id ?? participant.user_results?.result?.rest_id;
    if (restId !== undefined) {
        return restId === user.rest_id;
    }
    const username = user.core?.screen_name ?? user.legacy?.screen_name;
    return !!(username && participant.twitter_screen_name?.toLowerCase() === username.toLowerCase());
}

export function buildSpaceFeed(user: SpaceProfile, space?: AudioSpace): Data {
    const username = user.core?.screen_name ?? user.legacy?.screen_name;
    if (!username || typeof user.rest_id !== 'string' || !/^\d+$/.test(user.rest_id)) {
        throw new Error('X returned incomplete user metadata.');
    }
    const name = user.core?.name ?? user.legacy?.name ?? username;
    const link = `https://x.com/${username}`;
    const data: Data = {
        title: `${username} - Space speaking status`,
        link,
        item: [{ title: `${name} is not speaking in a live Space`, link, author: name, guid: `${user.rest_id}:spaces:inactive` }],
    };
    if (!space) {
        return data;
    }
    if (typeof space.metadata?.state !== 'string') {
        throw new TypeError('X returned incomplete Space status metadata.');
    }
    if (space.metadata.state !== 'Running') {
        return data;
    }
    if (!Array.isArray(space.participants?.admins) || !Array.isArray(space.participants?.speakers)) {
        throw new TypeError('X did not provide the Space speaker list.');
    }
    const host = space.participants.admins.some((participant) => participantMatches(participant, user));
    const speaker = space.participants.speakers.some((participant) => participantMatches(participant, user));
    if (!host && !speaker) {
        return data;
    }
    const metadata = space.metadata;
    if (!/^[a-z0-9]+$/i.test(metadata.rest_id) || typeof metadata.started_at !== 'number' || !Number.isSafeInteger(metadata.started_at) || metadata.started_at <= 0) {
        throw new Error('X did not provide a valid Space ID and actual start time.');
    }
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
    if (!config.twitter.authToken?.length) {
        throw new ConfigNotFoundError('Configure your own authorized TWITTER_AUTH_TOKEN to monitor Space speakers.');
    }
    const operations = buildGqlMap(await resolveQueryIds());
    const user = await cache.tryGet<SpaceProfile>(`twitter:spaces:profile:${username}`, async () => {
        const response = (await twitterGot(`${baseUrl}${operations.UserByScreenName}`, {
            variables: JSON.stringify({ screen_name: username, withSafetyModeUserFields: true }),
            features: JSON.stringify(gqlFeatures.UserByScreenName),
            fieldToggles: JSON.stringify({ withAuxiliaryUserLabels: false }),
        })) as ApiErrors & { data?: { user?: { result?: SpaceProfile } } };
        checkErrors(response, 'user lookup');
        const result = response.data?.user?.result;
        if (typeof result?.rest_id !== 'string' || !/^\d+$/.test(result.rest_id)) {
            throw new Error('X did not return this user. Check the username and authorized session.');
        }
        return result;
    });
    const presence = (await twitterGot(`${baseUrl}/fleets/v1/avatar_content`, { user_ids: user.rest_id })) as PresenceResponse;
    checkErrors(presence, 'Space presence lookup');
    if (!presence.users || typeof presence.users !== 'object' || Array.isArray(presence.users)) {
        throw new Error('X returned an unexpected Space presence response.');
    }
    const currentSpace = presence.users[user.rest_id]?.spaces?.live_content?.audiospace;
    if (currentSpace && typeof currentSpace.state !== 'string') {
        throw new TypeError('X returned incomplete Space presence metadata.');
    }
    if (!currentSpace || currentSpace.state !== 'RUNNING') {
        return buildSpaceFeed(user);
    }
    if (!currentSpace.id || !/^[a-z0-9]+$/i.test(currentSpace.id)) {
        throw new Error('X returned an invalid current Space ID.');
    }
    const spaceOperation = buildGqlMap(await resolveQueryIds(['AudioSpaceById'])).AudioSpaceById;
    if (!spaceOperation) {
        throw new Error('The current X AudioSpaceById query ID could not be resolved. Try again after the source API metadata is updated.');
    }
    const response = (await twitterGot(`${baseUrl}${spaceOperation}`, {
        variables: JSON.stringify({ id: currentSpace.id, isMetatagsQuery: false, withReplays: true, withListeners: false }),
        features: JSON.stringify(audioSpaceFeatures),
    })) as ApiErrors & { data?: { audioSpace?: AudioSpace } };
    checkErrors(response, 'Space speaker lookup');
    const space = response.data?.audioSpace;
    if (!space || space.metadata?.rest_id !== currentSpace.id) {
        throw new Error('X did not return metadata for the current Space.');
    }
    return buildSpaceFeed(user, space);
}
