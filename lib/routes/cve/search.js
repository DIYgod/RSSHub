const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx, next) => {
    const { keyword } = ctx.params;
    const link = `https://cve.mitre.org/cgi-bin/cvekey.cgi?keyword=${keyword}`;
    const body = await got(link).text();
    const $ = cheerio.load(body);
    const rows = $('#TableWithRules').find('tbody').first().find('tr').get().slice(0, 10);
    const item = rows.map((row) => {
        const [cveName, description] = $(row).find('td').get().map($);
        return {
            title: cveName.text(),
            link: 'https://cve.mitre.org' + cveName.find('a').first().attr('href'),
            description: description.text(),
            guid: this.link,
        };
    });
    ctx.state.data = {
        title: `CVE search result ${keyword}`,
        link,
        description: this.title,
        item,
    };
    await next();
};
