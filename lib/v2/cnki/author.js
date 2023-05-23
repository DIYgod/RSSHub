const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

const rootUrl = 'https://kns.cnki.net';

module.exports = async (ctx) => {
    const { code } = ctx.params;

    const authorInfoUrl = `${rootUrl}/kcms/detail/knetsearch.aspx?sfield=au&code=${code}`;
    const res = await got(authorInfoUrl);
    const $ = cheerio.load(res.data);
    const authorName = $('#showname').text();
    const companyName = $('body > div.wrapper > div.main > div.container.full-screen > div > div:nth-child(3) > h3:nth-child(2) > span > a').text();

    const res2 = await got(`${rootUrl}/kns8/Detail`, {
        searchParams: {
            sdb: 'CAPJ',
            sfield: '作者',
            skey: authorName,
            scode: code,
            acode: code,
        },
        followRedirect: false,
    });
    const authorPageUrl = res2.headers.location;

    const regex = /v=([^&]+)/;
    const code2 = authorPageUrl.match(regex)[1];

    const url = `${rootUrl}/restapi/knowledge-api/v1/experts/relations/resources?v=${code2}&sequence=PT&size=10&sort=desc&start=1&resource=CJFD`;

    const res3 = await got(url, { headers: { Referer: authorPageUrl } });
    const publications = res3.data.data.data;

    const list = publications.map((publication) => {
        const metadata = publication.metadata;
        const { value: title = '' } = metadata.find((md) => md.name === 'TI') || {};
        const { value: date = '' } = metadata.find((md) => md.name === 'PT') || {};
        const { value: filename = '' } = metadata.find((md) => md.name === 'FN') || {};

        return {
            title,
            link: `https://cnki.net/kcms/detail/detail.aspx?filename=${filename}&dbcode=CJFD`,
            author: authorName,
            pubDate: date,
        };
    });

    const items = await Promise.all(list.map((item) => ctx.cache.tryGet(item.link, () => utils.ProcessItem(item))));

    ctx.state.data = {
        title: `知网 ${authorName} ${companyName}`,
        link: authorInfoUrl,
        item: items,
    };
};
