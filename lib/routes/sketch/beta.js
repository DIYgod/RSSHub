const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.sketch.com/beta/',
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const titledata = $('.update-details h4')
        .first()
        .html();
    // const versiondata=Number(titledata.substr(-2));
    const content = $('.update-details').html();

    ctx.state.data = {
        title: titledata,
        link: response.url,
        description: content,
        allowEmpty: true,
    };
};
