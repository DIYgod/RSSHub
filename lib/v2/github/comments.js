const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const typeDict = {
    issues: {
        typeRootUrl: '/issues',
    },
    pull: {
        typeRootUrl: '/pulls',
    },
};

module.exports = async (ctx) => {
    const user = ctx.params.user;
    const repo = ctx.params.repo;
    const type = ctx.params.type ?? 'issues';
    const number = ctx.params.number ?? '1';

    const rootUrl = 'https://github.com';

    const response = await got({
        method: 'get',
        url: `${rootUrl}/${user}/${repo}/${type}/${number}`,
        header: {
            Referer: `${rootUrl}/${user}/${repo}${typeDict[type].typeRootUrl}`,
        },
    });

    const $ = cheerio.load(response.data);

    const list = $('div.timeline-comment-group.js-minimizable-comment-group.js-targetable-element.TimelineItem-body.my-0')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.find('div.edit-comment-hide').text().trim(),
                description: art(path.join(__dirname, 'templates/comments-description.art'), {
                    desc: item.find('div.edit-comment-hide').html(),
                }),
                author: item.find('strong.css-truncate').text().trim(),
                pubDate: parseDate(item.find('relative-time.no-wrap').attr('datetime')),
                link: `${rootUrl}/${user}/${repo}/${type}/${number}` + item.find('a.Link--secondary.js-timestamp').attr('href'),
            };
        })
        .get();

    const items = await Promise.all(list && list.map((item) => ctx.cache.tryGet(item.link, () => item)));

    ctx.state.data = {
        title: $('span.author.flex-self-stretch').text().trim() + '/' + $('strong.mr-2.flex-self-stretch').text().trim() + `: ${type} #${number}`,
        description: $('span.author.flex-self-stretch').text().trim() + '/' + $('strong.mr-2.flex-self-stretch').text().trim() + ': ' + $('h1.gh-header-title.mb-2.lh-condensed.f1.mr-0.flex-auto.break-word').text().trim(),
        link: `${rootUrl}/${user}/${repo}/${type}/${number}`,
        item: items,
    };

    ctx.state.json = {
        title: $('span.author.flex-self-stretch').text().trim() + '/' + $('strong.mr-2.flex-self-stretch').text().trim() + `: ${type} #${number}`,
        description: $('span.author.flex-self-stretch').text().trim() + '/' + $('strong.mr-2.flex-self-stretch').text().trim() + ': ' + $('h1.gh-header-title.mb-2.lh-condensed.f1.mr-0.flex-auto.break-word').text().trim(),
        link: `${rootUrl}/${user}/${repo}/${type}/${number}`,
        item: items,
    };
};
