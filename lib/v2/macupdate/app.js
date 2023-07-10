const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { appId, appSlug } = ctx.params;
    const baseUrl = 'https://www.macupdate.com';
    const link = `${baseUrl}/app/mac/${appId}${appSlug ? `/${appSlug}` : ''}`;

    const { data: response } = await got(link);
    const $ = cheerio.load(response);

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

    ctx.state.data = {
        title: appData.title,
        description: appData.description,
        link: `${baseUrl}${asPath}`,
        logo: appData.logo.source,
        icon: appData.logo.source,
        item: [item],
        language: 'en',
    };

    ctx.state.json = {
        pageProps: nextData.props.initialProps.pageProps,
    };
};
