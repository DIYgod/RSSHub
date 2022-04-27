const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async function fetch(address) {
    const res = await got(address);
    const $ = cheerio.load(res.data);
    return {
        description: $('[name="_newscontent_fromname"]').html(),
        link: address,
        guid: address,
    };
};
