const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const FQDN = 'feedback.remnote.com';
const apiGateway = 'https://gateway.hellonext.co';

module.exports = async (ctx) => {
    const { data } = await got(`${apiGateway}/api/v2/changelogs`, {
        headers: {
            'x-organization': FQDN,
        },
        searchParams: {
            page: 1,
            status: 'published',
        },
    });

    const items = data.map((item) => ({
        title: item.title,
        description: item.description_html,
        link: `https://${FQDN}/changelog/${item.slug}`,
        pubDate: parseDate(item.published_at.timestamp),
        author: item.user.name,
    }));

    ctx.state.data = {
        title: 'Changelog | RemNote',
        description: 'Vote or request new RemNote features. Subscribe to get updates about new features from RemNote.',
        link: `https://${FQDN}/changelog`,
        image: 'https://vault.hnxt.dev/uploads/organization_customization/favicon/3970/88153ff13b4b03492ddfee6e675228c1.png',
        item: items,
        language: 'en-US',
    };
};
