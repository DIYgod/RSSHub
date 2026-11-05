import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

const workshopFileTypes = {
    0: 'Community',
    1: 'Microtransaction',
    2: 'Collection',
    3: 'Art',
    4: 'Video',
    5: 'Screenshot',
    6: 'Game',
    7: 'Software',
    8: 'Concept',
    9: 'WebGuide',
    10: 'IntegratedGuide',
    11: 'Merch',
    12: 'ControllerBinding',
    13: 'SteamworksAccessInvite',
    14: 'SteamVideo',
    15: 'GameManagedItem',
};

export const route: Route = {
    path: '/appcommunityfeed/:appid/:routeParams?',
    categories: ['game'],
    example: '/steam/appcommunityfeed/730',
    parameters: {
        appid: 'Steam appid, can be found on the community hub page or store page URL.',
        routeParams: 'Query parameters.',
    },
    radar: [
        {
            title: 'Community Hub',
            source: ['steamcommunity.com/app/:appid'],
            target: '/appcommunityfeed/:appid',
        },
        {
            title: 'Community Hub',
            source: ['store.steampowered.com/app/:appid/*/'],
            target: '/appcommunityfeed/:appid',
        },
    ],
    description: `Query Parameters:

| Name                   | Type   | Description                                             |
| ---------------------- | ------ | ------------------------------------------------------- |
| p                      | string | Compatibility parameter; always requests the first page |
| rgSections\\[]          | string | rgSections                                              |
| filterLanguage         | string | Filter Language                                         |
| languageTag            | string | Language Tag                                            |
| nMaxInappropriateScore | string | Max Inappropriate Score                                 |

Example:

- \`/appcommunityfeed/730/p=1&rgSections[]=2&rgSections[]=4&filterLanguage=english&languageTag=english&nMaxInappropriateScore=1\` for CS2 Screenshot and Artwork contents.
- \`/appcommunityfeed/730/rgSections[]=6\` for CS2 Workshop contents only.
- \`/appcommunityfeed/570/rgSections[]=3&rgSections[]=9\` for Dota2 Video and Guides contents.

::: tip
It can also access community hub contents that require a logged-in account.
:::`,
    name: 'Community Hub Feeds',
    maintainers: ['NyaaaDoge'],

    handler: async (ctx) => {
        const { appid = 730, routeParams } = ctx.req.param();

        const baseUrl = 'https://steamcommunity.com';
        const query = new URLSearchParams(routeParams);
        if (query.has('p')) {
            query.set('p', '1');
        }
        const apiUrl = `${baseUrl}/library/appcommunityfeed/${appid}${query.size ? `?${query}` : ''}`;
        const response = await ofetch(apiUrl);

        return {
            title: `${appid} Steam Community Hub`,
            link: `https://steamcommunity.com/app/${appid}`,
            item: response.hub.map((item) => ({
                title: item.title === '' ? workshopFileTypes[item.type] : item.title,
                link: `https://steamcommunity.com/sharedfiles/filedetails/?id=${item.published_file_id}`,
                description: renderToString(<SteamAppCommunityDescription image={item.full_image_url} videoId={item.youtube_video_id} description={item.description} />),
                author: item.creator.name,
                category: workshopFileTypes[item.type],
            })),
        };
    },
};

const SteamAppCommunityDescription = ({ image, videoId, description }: { image?: string; videoId?: string; description?: string }) => (
    <>
        {image ? <img src={image} /> : null}
        {videoId ? <iframe src={`https://www.youtube-nocookie.com/embed/${videoId}`} title="YouTube video player" allowFullScreen /> : null}
        <p>{description}</p>
    </>
);
