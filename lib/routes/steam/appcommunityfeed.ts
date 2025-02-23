import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import ofetch from '@/utils/ofetch';
import { art } from '@/utils/render';
import path from 'node:path';

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

| Name                   | Type   | Description             |
| ---------------------- | ------ | ----------------------- |
| p                      | string | p                       |
| rgSections[]           | string | rgSections              |
| filterLanguage         | string | Filter Language         |
| languageTag            | string | Language Tag            |
| nMaxInappropriateScore | string | Max Inappropriate Score |

Example:
- \`/appcommunityfeed/730/p=1&rgSections[]=2&rgSections[]=4&filterLanguage=english&languageTag=english&nMaxInappropriateScore=1\` for CS2 Screenshot and Artwork contents.
- \`/appcommunityfeed/730/rgSections[]=6\` for CS2 Workshop contents only.
- \`/appcommunityfeed/570/rgSections[]=3&rgSections[]=9\` for Dota2 Video and Guides contents.

::: tip
It can also access community hub contents that require a logged-in account.
:::
`,
    name: 'Steam Community Hub Feeds',
    maintainers: ['NyaaaDoge'],

    handler: async (ctx) => {
        const { appid = 730, routeParams } = ctx.req.param();

        const baseUrl = 'https://steamcommunity.com';
        const apiUrl = `${baseUrl}/library/appcommunityfeed/${appid}${routeParams ? `?${routeParams}` : ''}`;
        const response = await ofetch(apiUrl);

        return {
            title: `${appid} Steam Community Hub`,
            link: `https://steamcommunity.com/app/${appid}`,
            item: response.hub.map((item) => ({
                title: item.title === '' ? workshopFileTypes[item.type] : item.title,
                link: `https://steamcommunity.com/sharedfiles/filedetails/?id=${item.published_file_id}`,
                description: art(path.join(__dirname, 'templates/appcommunityfeed-description.art'), {
                    image: item.full_image_url,
                    description: item.description,
                }),
                author: item.creator.name,
                category: workshopFileTypes[item.type],
            })),
        };
    },
};
