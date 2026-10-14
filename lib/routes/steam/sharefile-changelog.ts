import { load } from 'cheerio';

import NotFoundError from '@/errors/types/not-found';
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
- \`p=\` compatibility parameter; always requests the first page (p=1).`,
    name: 'Sharefile Changelog',
    maintainers: ['NyaaaDoge'],

    handler: async (ctx) => {
        const { sharefileID, routeParams } = ctx.req.param();

        const query = new URLSearchParams(routeParams);
        if (query.has('p')) {
            query.set('p', '1');
        }
        const url = `https://steamcommunity.com/sharedfiles/filedetails/changelog/${sharefileID}${query.size ? `?${query}` : ''}`;
        const response = await ofetch(url);
        const $ = load(response);

        const appName = $('div.apphub_AppName').text();
        const appIcon = $('div.apphub_AppIcon').children('img').attr('src');
        const itemTitle = $('div.workshopItemTitle').text();

        const items = $('div.clearfix .changeLogCtn')
            .toArray()
            .map((item) => {
                const $item = $(item);
                // changelogHeadline is local time
                const changelogHeadline = $item.find('.headline').text();
                const changelogTimestamp = $item.find('p').attr('id');
                if (!changelogTimestamp || !/^\d+$/.test(changelogTimestamp)) {
                    throw new NotFoundError(`Workshop ${sharefileID} changelog entry has no valid timestamp ID at ${url}`);
                }
                const changeDetail = $item.find('p').html();

                return {
                    title: changelogHeadline,
                    guid: `${sharefileID}:${changelogTimestamp}`,
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
