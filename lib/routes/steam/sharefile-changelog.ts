import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/sharefile-changelog/:sharefileID/:routeParams?',
    categories: ['game'],
    example: '/steam/sharefile-changelog/2851063440/l=schinese',
    parameters: {
        sharefileID: 'Steam community sharefile id. Usually refers to a workshop item.',
        routeParams: 'Route parameters.',
    },
    radar: [
        {
            title: 'Sharefile Changelog',
            source: ['steamcommunity.com/sharedfiles/filedetails/changelog/:sharefileID'],
            target: '/sharefile-changelog/:sharefileID',
        },
    ],
    description: `Steam Community Sharefile's Changelog. Primary used for a workshop item.
Helpful route parameters:
- \`l=\` language parameter, change the language of description.
- \`p=\` page parameter, change the results page. p=1 by default.
`,
    name: 'Sharefile Changelog',
    maintainers: ['NyaaaDoge'],

    handler: async (ctx) => {
        const { sharefileID, routeParams } = ctx.req.param();

        const url = `https://steamcommunity.com/sharedfiles/filedetails/changelog/${sharefileID}${routeParams ? `?${routeParams}` : ''}`;
        const response = await ofetch(url);
        const $ = load(response);

        const appName = $('div.apphub_AppName').first().text();
        const appIcon = $('div.apphub_AppIcon').children('img').attr('src');
        const itemTitle = $('div.workshopItemTitle').first().text();

        const items = $('div.clearfix .changeLogCtn')
            .toArray()
            .map((item) => {
                item = $(item);
                // changelogHeadline is local time
                const changelogHeadline = item.find('.headline').first().text();
                const changelogTimestamp = item.find('p').first().attr('id');
                const changeDetail = item.find('p').first().html();

                return {
                    title: changelogHeadline,
                    link: `https://steamcommunity.com/sharedfiles/filedetails/changelog/${sharefileID}`,
                    description: changeDetail,
                    pubDate: parseDate(changelogTimestamp, 'X'),
                };
            });

        return {
            title: itemTitle,
            link: `https://steamcommunity.com/sharedfiles/filedetails/changelog/${sharefileID}`,
            description: `${appName} steam community sharefile changelog`,
            item: items,
            icon: appIcon,
        };
    },
};
