const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const section = ctx.params.section ?? 'index';
    const type = ctx.params.type ?? 'sources';
    const user = ctx.params.user ?? '';

    const rootUrl = 'https://news.ycombinator.com';
    const currentUrl = `${rootUrl}${section === 'index' ? '' : `/${section}`}${user === '' ? '' : '?id=' + user}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.athing')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 30)
        .map((_, thing) => {
            thing = $(thing);

            const item = {};

            item.guid = thing.attr('id');
            item.title = thing.find('.titlelink').text();
            item.category = thing.find('.sitestr').text();
            item.author = thing.next().find('.hnuser').text();
            item.pubDate = parseDate(thing.find('.age').attr('title') ?? thing.next().find('.age').attr('title'));

            item.link = `${rootUrl}/item?id=${item.guid}`;
            item.origin = thing.find('.titlelink').attr('href');
            item.onStory = thing.find('.onstory').text().substring(2);

            item.comments = thing.next().find('a').last().text().split(' comment')[0];
            item.currentComment = thing.find('.comment').text();
            item.guid = type === 'sources' ? item.guid : `${item.guid}${item.comments === 'discuss' ? '' : `-${item.comments}`}`;

            item.description = `<a href="${item.link}">Comments on Hacker News</a> | <a href="${item.origin}">Source</a>`;

            return item;
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.guid, async () => {
                if (item.comments !== 'discuss' && type === 'comments') {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = cheerio.load(detailResponse.data);

                    content('.reply').remove();

                    item.description = '';

                    content('.comtr').each(function () {
                        const author = content(this).find('.hnuser');
                        const comment = content(this).find('.commtext');

                        item.description +=
                            `<div><div><small><a href="${rootUrl}/${author.attr('href')}">${author.text()}</a></small>` +
                            `&nbsp&nbsp<small><a href="${rootUrl}/item?id=${content(this).attr('id')}">` +
                            `${content(this).find('.age').attr('title')}</a></small></div>`;

                        const commentText = comment.clone();

                        commentText.find('p').remove();
                        commentText.html(`<p>${commentText.text()}</p>`);
                        commentText.append(
                            comment
                                .find('p')
                                .toArray()
                                .map((p) => `<p>${content(p).html()}</p>`)
                        );

                        item.description += `<div>${commentText.html()}</div></div>`;
                    });
                } else if (item.comments !== 'discuss' && type === 'comments_list') {
                    item.title = item.onStory;
                    item.description = item.currentComment;
                }

                item.link = type === 'sources' ? item.origin : item.link;

                delete item.origin;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
