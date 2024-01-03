const got = require('@/utils/got');
const cheerio = require('cheerio');
const md = require('markdown-it')({
    html: true,
    xhtmlOut: true,
    breaks: true,
    linkify: true,
});

module.exports = async (ctx) => {
    const id = ctx.params.id ?? 47327;
    const link = `https://www.luogu.com.cn/discuss/${id}`;
    const response = await got(link);
    const $ = cheerio.load(response.data);
    const title = $('head title').text();

    const injection_script = $('head script')
        .filter((_, el) => $(el).text().startsWith('window._feInjection'))
        .first()
        .text();
    // the window._feConfigVersion and window._tagVersion seems to be a constant, but in cast it will change, write a regexp to match it.
    const JSONRaw = injection_script.replaceAll('window._feInjection = JSON.parse(decodeURIComponent("', '').replace(/"\)\);window._feConfigVersion=(\d*);window._tagVersion=(\d*);/g, '');
    const JSONDecode = JSON.parse(decodeURIComponent(JSONRaw));

    const MDRaw = JSONDecode.currentData.post.content;
    const MDDecode = md.render(MDRaw).replaceAll('\n', '<br />');

    const $firstPost = cheerio.load(MDDecode);
    const issueHeading = $firstPost('strong').first().text().trim();
    const dailyLink = $firstPost.root().find('a').first().attr('href');
    const { data: dailyResponse } = await got(dailyLink);
    const $daily = cheerio.load(dailyResponse);
    const item = [
        {
            title,
            description: $daily('#article-content').html(),
            link,
            author: JSONDecode.currentData.post.author.name,
            guid: `${link}#${issueHeading}`,
            pubDate: Date(JSONDecode.currentData.post.time),
        },
    ];

    ctx.state.data = {
        title: '洛谷日报',
        link,
        item,
    };
};
