const axios = require('../../utils/axios');
const cheerio = require('cheerio');
module.exports = async (ctx) => {
    const pkg = ctx.params.pkg;
    const url = `https://www.npmjs.com/package/${pkg}`;
    const res = await axios.get(url);
    const data = res.data;
    let json = data.match(/"versions":\[{".+}],"deprecations/g)[0];
    json = `{${json.substring(0, json.length - 14)}}`;
    const { versions } = JSON.parse(json);
    const count = [];
    for (let i = 0; i < Math.min(versions.length, 5); i++) {
        count.push(i);
    }
    const out = await Promise.all(
        count.map(async (i) => {
            const detailUrl = `${url}/v/${versions[i].version}`;
            const value = await ctx.cache.get(detailUrl);
            if (value) {
                return Promise.resolve(value);
            } else {
                const res = await axios.get(detailUrl);
                const $ = cheerio.load(res.data);
                const single = {
                    title: `${$('.package-name-redundant').text()} ${versions[i].version}`,
                    link: detailUrl,
                    pubDate: $('time')
                        .first()
                        .attr('datetime'),
                    description: $('#readme').html(),
                };
                ctx.cache.set(detailUrl, single, 5 * 60 * 60);
                return Promise.resolve(single);
            }
        })
    );
    ctx.state.data = {
        title: `${pkg} Update Reminder`,
        link: url,
        item: out,
    };
};
