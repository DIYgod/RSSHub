import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/profile/:handle',
    name: 'Link3 Profile',
    url: 'link3.to',
    maintainers: ['cxheng315'],
    example: '/link3/profile/synfutures_defi',
    parameters: { handle: 'Profile handle' },
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['link3.to/:handle'],
            target: '/:handle',
        },
    ],
    handler,
};

async function handler(ctx) {
    const url = 'https://api.cyberconnect.dev/profile/';

    const handle = ctx.req.param('handle');

    const response = await ofetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: {
            variables: {
                handle,
            },
            query: `
                query getProfile($id: ID, $handle: String) {
                    profile(id: $id, handle: $handle) {
                        status
                        data {
                            handle
                            ... on OrgProfile {
                                displayName
                                bio
                                profilePicture
                                backgroundPicture
                                __typename
                            }
                            ... on PerProfile {
                                bio
                                personalDisplayName: displayName {
                                    displayName
                                }
                                personalProfilePicture: profilePicture {
                                    picture
                                }
                                personalBackgroundPicture: backgroundPicture {
                                    picture
                                }
                                __typename
                            }
                            blocks {
                                ... on Block {
                                    ... on EventBlock {
                                        __typename
                                        events {
                                            id
                                            title
                                            info
                                            posterUrl
                                            startTimestamp
                                            endTimestamp
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

            `,
        },
    });

    const status = response.data.profile.status;

    if (status !== 'SUCCESS') {
        return {
            title: 'Error',
            description: 'Profile not found',
            items: [
                {
                    title: 'Error',
                    description: 'Profile not found',
                    link: `https://link3.to/${handle}`,
                },
            ],
        };
    }

    const profile = response.data.profile.data;

    const items = profile.blocks
        .filter((block) => block.__typename === 'EventBlock')
        .flatMap((block) => block.events)
        .map((event) => ({
            title: event.title,
            link: `https://link3.to/e/${event.id}`,
            description: event.info ?? '',
            author: profile.handle,
            guid: event.id,
            pubDate: event.startTimestamp ? parseDate(event.startTimestamp * 1000) : null,
            itunes_item_image: event.posterUrl,
            itunes_duration: event.endTimestamp - event.startTimestamp,
        }));

    return {
        title: profile.displayName ?? profile.personalDisplayName.displayName,
        link: `https://link3.to/${profile.handle}`,
        description: profile.bio,
        logo: profile.profilePicture ?? profile.personalProfilePicture.picture,
        image: profile.profilePicture ?? profile.personalProfilePicture.picture,
        author: profile.handle,
        item:
            items && items.length > 0
                ? items
                : [
                      {
                          title: 'No events',
                          description: 'No events',
                          link: `https://link3.to/${handle}`,
                      },
                  ],
    };
}
