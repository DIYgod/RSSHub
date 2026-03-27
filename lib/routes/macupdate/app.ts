import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/app/:appId/:appSlug?',
    categories: ['program-update'],
    example: '/macupdate/app/11942',
    parameters: { appId: 'Application unique ID, can be found in URL', appSlug: 'Application slug, can be found in URL' },
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
            source: ['macupdate.com/app/mac/:appId/:appSlug'],
        },
    ],
    name: 'Update',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { appId, appSlug } = ctx.req.param();
    const baseUrl = 'https://www.macupdate.com';
    const link = `${baseUrl}/app/mac/${appId}${appSlug ? `/${appSlug}` : ''}`;

    const response = await ofetch(link);
    const $ = load(response);

    const nextData = JSON.parse($('#__NEXT_DATA__').text());

    const {
        asPath,
        appData: { data: appData },
    } = nextData.props.pageProps;

    const item = {
        title: `${appData.title} ${appData.version}`,
        description: appData.release_notes,
        pubDate: parseDate(appData.date.timestamp, 'X'),
        link: `${baseUrl}${asPath}`,
        guid: `macupdate/app/${appId}/${appData.version}`,
        category: [appData.category.name, appData.subcategory?.name],
        author: appData.developer.name,
    };

    return {
        title: appData.title,
        description: appData.description,
        link: `${baseUrl}${asPath}`,
        logo: appData.logo.source,
        icon: appData.logo.source,
        item: [item],
        language: 'en',
    };
}
