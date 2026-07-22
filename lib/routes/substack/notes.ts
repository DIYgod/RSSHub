import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { buildSubstackNoteItem, isSubstackNote, type SubstackActivityFeed, type SubstackPost, type SubstackPublicationResponse } from '@/utils/substack';
import { isValidHost } from '@/utils/valid-host';

export const route: Route = {
    path: '/notes/:user',
    categories: ['blog'],
    view: ViewType.SocialMedia,
    example: '/substack/notes/norsemanmarkettiming',
    parameters: { user: 'Substack publication subdomain' },
    features: {
        requireConfig: [
            {
                name: 'SUBSTACK_COOKIE',
                optional: true,
                description: 'Complete Cookie header from a logged-in Substack session. Use only on a trusted self-hosted instance; protected Notes are returned only when that account already has access.',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Notes',
    maintainers: ['pseudoyu'],
    handler,
    description: `Returns the Notes activity published by a Substack publication's author. Set SUBSTACK\\_COOKIE on a trusted RSSHub instance to use an authenticated Substack session; protected activity is returned only when that account already has access.`,
};

async function handler(ctx) {
    const user = ctx.req.param('user');

    if (!isValidHost(user)) {
        throw new InvalidParameterError('Invalid user');
    }

    const baseUrl = `https://${user}.substack.com`;
    const cookie = config.substack.cookie;
    const publicationHeaders = {
        Referer: baseUrl,
        'User-Agent': config.ua,
        ...(cookie && { Cookie: cookie }),
    };
    const readerHeaders = {
        Referer: 'https://substack.com/',
        'User-Agent': config.ua,
        ...(cookie && { Cookie: cookie }),
    };

    const archive = await cache.tryGet(`substack:archive-profile:v2:${user}`, () =>
        ofetch<SubstackPost[]>(`${baseUrl}/api/v1/archive`, {
            headers: publicationHeaders,
            query: {
                sort: 'new',
                search: '',
                offset: 0,
                limit: 1,
            },
        })
    );
    const publicationId = archive[0]?.publication_id;
    if (!publicationId) {
        throw new Error(`Unable to resolve the Substack publication for ${user}`);
    }

    const publicationResponse = await cache.tryGet(`substack:publication:v2:${publicationId}`, () =>
        ofetch<SubstackPublicationResponse>(`https://substack.com/api/v1/publication/public/${publicationId}`, {
            headers: readerHeaders,
        })
    );
    const publication = publicationResponse.pub;
    const profileId = publication?.author_id || publication?.primary_user_id;
    if (!profileId || !publication?.author_handle) {
        throw new Error(`Unable to resolve the primary Substack author for ${user}`);
    }

    const profile = {
        id: profileId,
        name: publication.author_name,
        handle: publication.author_handle,
        photo_url: publication.author_photo_url,
        bio: publication.hero_text,
        primaryPublication: {
            logo_url: publication.logo_url,
        },
    };
    const activity = await cache.tryGet(`substack:notes:v2:${profileId}`, () =>
        ofetch<SubstackActivityFeed>(`https://substack.com/api/v1/reader/feed/profile/${profileId}`, {
            query: {
                types: 'note',
            },
            headers: readerHeaders,
        })
    );
    const item = (activity.items ?? []).filter((activityItem) => isSubstackNote(activityItem)).map((activityItem) => buildSubstackNoteItem(activityItem.comment, profile));
    const handle = publication.author_handle;
    const name = publication.author_name || user;

    return {
        title: `${name} on Substack Notes`,
        description: publication.hero_text || `${name}'s Substack Notes`,
        link: `https://substack.com/@${handle}/notes`,
        image: publication.author_photo_url || publication.logo_url || '',
        item,
    };
}
