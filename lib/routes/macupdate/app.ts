// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const { appId, appSlug } = ctx.req.param();
    const baseUrl = 'https://www.macupdate.com';
    const link = `${baseUrl}/app/mac/${appId}${appSlug ? `/${appSlug}` : ''}`;

    const { data: response } = await got(link);
    const $ = load(response);

    const nextData = JSON.parse($('#__NEXT_DATA__').text());

    const {
        asPath,
        appData: { data: appData },
    } = nextData.props.initialProps.pageProps;

    const item = {
        title: `${appData.title} ${appData.version}`,
        description: appData.release_notes,
        pubDate: parseDate(appData.date.timestamp, 'X'),
        link: `${baseUrl}${asPath}`,
        guid: `macupdate/app/${appId}/${appData.version}`,
        category: [appData.category.name, appData.subcategory?.name],
        author: appData.developer.name,
    };

    ctx.set('data', {
        title: appData.title,
        description: appData.description,
        link: `${baseUrl}${asPath}`,
        logo: appData.logo.source,
        icon: appData.logo.source,
        item: [item],
        language: 'en',
    });

    ctx.set('json', {
        pageProps: nextData.props.initialProps.pageProps,
    });
};
