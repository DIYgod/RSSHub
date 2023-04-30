const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'https://kns.cnki.net';

module.exports = async (ctx) => {
    const { code } = ctx.params;

    const authorPageUrl = `${rootUrl}/kcms2/author/detail?v=${code}&uniplatform=NZKPT`;

    const res = await got(authorPageUrl);
    const $ = cheerio.load(res.data);
    const authorName = $('#au-name').attr('value');

    const url = `${rootUrl}/restapi/knowledge-api/v1/experts/relations/resources?v=${code}&sequence=PT&size=10&sort=desc&start=1&resource=CJFD`;

    const res2 = await got(url, {headers: {Referer: authorPageUrl}});
    const list = res2.data.data.data;

    const items = list.map((item) => {
        const metadata = item.metadata;
        const relations = item.relations;
        const {value: title = ''} = metadata.find((md) => md.name === 'TI') || {};
        const {value: date = ''} = metadata.find((md) => md.name === 'PT') || {};
        const {value: author = ''} = metadata.find((md) => md.name === 'AU') || {};

        return {
          title,
          link: relations[0].url,
          author,
          pubDate: date
        };
      });

    ctx.state.data = {
        title: `知网 ${authorName}`,
        link: authorPageUrl,
        item: items,
    };
};
