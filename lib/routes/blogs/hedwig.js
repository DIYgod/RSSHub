const got = require('@/utils/got');
const cheerio = require('cheerio');
const md = require('markdown-it')({
    html: true,
});
const dayjs = require('dayjs');
const { isValidHost } = require('@/utils/valid-host');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    if (!isValidHost(type)) {
        throw Error('Invalid type');
    }

    const url = `https://${type}.hedwig.pub`;
    const res = await got({
        method: 'get',
        url,
    });
    const $ = cheerio.load(res.data);
    const content = JSON.parse($('#__NEXT_DATA__')[0].children[0].data);
    const title = $('title').text();

    const list = content.props.pageProps.issuesByNewsletter.map((item) => {
        let description = '';
        item.blocks.forEach((block) => {
            description += md.render(block.markdown.text);
        });
        return {
            title: item.subject,
            description,
            pubDate: dayjs(`${item.publishAt} +0800`, "YYYY-MM-DD'T'HH:mm:ss.SSS'Z'").toString(),
            link: `https://${type}.hedwig.pub/i/${item.urlFriendlyName}`,
        };
    });
    ctx.state.data = {
        title: `Ⓙ Hedwig - ${title}`,
        description: content.props.pageProps.newsletter.about,
        link: `https://${type}.hedwig.pub`,
        item: list,
    };
};
