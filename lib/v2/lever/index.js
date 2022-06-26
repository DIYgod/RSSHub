const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

// Initiate a HTTP GET request
module.exports = async (ctx) => {
    const domain = ctx.params.domain;
    const response = await got(`https://api.lever.co/v0/postings/${domain}?mode=json`);
    const data = response.data;
    ctx.state.data = {
        // the source title
        title: `${domain}'s Job feed in RSS`,
        // the source link
        link: `https://api.lever.co/v0/postings/${domain}`,
        // the source description
        description: `Auto Generated RSS Spec for ${domain}`,
        // iterate through all leaf objects
        item: data.map((item) => ({
            // the article title
            title: item.text,
            // the article content
            description: item.descriptionPlain,
            // the article publish time
            pubDate: parseDate(item.createdAt),
            // the article link
            link: item.hostedUrl,
        })),
    };
};
