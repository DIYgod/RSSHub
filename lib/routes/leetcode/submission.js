const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const country = ctx.params.country;
    const user = ctx.params.user;
    let url, state, description;
    if (country === 'cn') {
        url = 'https://leetcode-cn.com/';
    } else {
        url = 'https://leetcode.com/';
    }
    const response = await got({
        method: 'get',
        url: url + `${user}`,
        headers: {
            Referer: url,
        },
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const username = $('div.panel-body')
        .find('h4')
        .text();
    const img = $('div.panel-body')
        .find('img')
        .attr('src'); // 用户的头像
    const src = `<img referrerpolicy="no-referrer" src="${img}">`;
    const solvedQuestion = $('ul.list-group')
        .eq(2)
        .children()
        .eq(0)
        .find('span')
        .text(); // 解决的题目
    const acceptedSubmission = $('ul.list-group')
        .eq(2)
        .children()
        .eq(1)
        .find('span')
        .text(); // 通过的提交
    const acceptanceRate = $('ul.list-group')
        .eq(2)
        .children()
        .eq(2)
        .find('span')
        .text(); // 通过率
    if (country === 'cn') {
        state = ' 的刷题动态';
        description = '解决的题目： ' + solvedQuestion + '<br>通过的提交： ' + acceptedSubmission + '<br>通过率： ' + acceptanceRate + '<br>' + src;
    } else {
        state = ' Most recent submissions';
        description = 'Solved Question: ' + solvedQuestion + '<br>Accepted Submission: ' + acceptedSubmission + '<br>Acceptance Rate: ' + acceptanceRate + '<br>' + src;
    }

    const list = $('ul.list-group')
        .eq(-1)
        .children()
        .get();
    const result = await util.ProcessFeed(list, country);
    ctx.state.data = {
        title: username + state,
        description: description,
        item: result,
    };
};
