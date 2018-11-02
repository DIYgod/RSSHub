const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const parseItems = require('./items_parser');

module.exports = async (ctx) => {
    const { team_id } = ctx.params;
    const { data } = await axios({
        method: 'get',
        url: `http://share.dmhy.org/topics/list/team_id/${team_id}`,
    });
    const $ = cheerio.load(data);
    const item = parseItems($);
    const team = $('title')
        .text()
        .split('(#')[0]
        .trim();
    ctx.state.data = {
        title: team,
        link: `http://share.dmhy.org/topics/list/team_id/${team_id}`,
        description: `动漫花园联盟: ${team}`,
        item,
    };
};
