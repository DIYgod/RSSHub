const got = require('@/utils/got');
const config = require('@/config').value;

// Unchanged entries status after fetching.
// mark = unchanged | read | removed | unread
let mark = 'unchanged';
// Return shared link as default behavior
// link = shared | original
// let link = 'shared';
// Add feed's name to each article, default is off.
let addFeedName = 0;
// Here we use `limit` to temporarily store the limit number.
let limit = 0;

module.exports = async (ctx) => {
    const instance = config.miniflux.instance;
    const token = config.miniflux.token;

    if (!token) {
        throw new Error('This RSS feed is disabled due to its incorrect configuration: the token is missing.');
    }

    // In this function, var`mark`, `link`, and `limit`, `addFeedName`
    // could be changed.
    function filterHandler(item) {
        if (item.search('=') === -1) {
            return '';
        }

        const filter = item.substring(0, item.indexOf('='));
        const option = item.substring(item.lastIndexOf('=') + 1);

        switch (filter) {
            case 'mark':
                if ((option === 'read' || option === 'removed' || option === 'unread') && !setMark.length) {
                    mark = option;
                    setMark.push(1);
                }
                item = '';
                break;
            // case 'link':
            //     (option == 'original') ?
            //         link = option :
            //         link = 'shared';
            //     item = '';
            //     break;
            case 'feed_name':
                if (Number.parseInt(option) === 1 && !setFeedName.length) {
                    addFeedName = 1;
                    setFeedName.push(1);
                }
                item = '';
                break;
            case 'direction':
                if (option !== 'asc') {
                    item = 'direction=desc';
                }
                break;
            // If user mistakenly set `category=Int`
            case 'category':
                isNaN(Number.parseInt(option)) ? (item = '') : (item = `category_id=${option}`);
                break;
            case 'order':
                if (option !== 'id' && option !== 'category_title' && option !== 'published_at' && option !== 'status' && option !== 'category_id') {
                    item = '';
                }
                break;
            // Program should behave differently for `limit` parameter in
            // each mode. So currently we only save the (last & existed)
            // parameter, since user may mistakenly input this parameter
            // several times.
            case 'limit':
                if (!isNaN(option) && !setLimit.length) {
                    limit = option;
                    setLimit.push(1);
                }
                item = '';
                break;
            default:
                break;
        }
        return item;
    }

    const entriesID = [];
    const feedsName = [];
    const articles = [];

    // MiniFlux will only preserve the *first* valid filter option
    // for each parameter, in order to matching the default behavior
    // here we use arrays to track the setting for `limit`,
    // `mark` and `feed_name`.
    const setLimit = [];
    const setMark = [];
    const setFeedName = [];

    const feeds = ctx.params.feeds;

    let parameters = ctx.params.parameters;
    // Set default direction
    if (parameters.search('direction=') === -1) {
        parameters += '&direction=desc';
    }

    parameters = parameters
        .split('&')
        .map((item) => filterHandler(item))
        .filter(Boolean)
        .join('&');

    if (feeds.search(/feeds?=/g) !== -1 || !isNaN(Number.parseInt(feeds.split('&').join('')))) {
        const feedsID = feeds.replaceAll(/feeds?=/g, '');
        const feedsList = [feedsID.split('&')].flat();

        if (limit && ctx.query.limit) {
            if (limit < ctx.query.limit) {
                ctx.query.limit = limit * feedsList.length;
            } else {
                const eachLimit = Number.parseInt(ctx.query.limit / feedsList.length);
                if (eachLimit) {
                    limit = eachLimit;
                } else {
                    limit = 1;
                    ctx.query.limit = feedsList.length;
                }
            }
            parameters += `&limit=${limit}`;
        } else if (limit) {
            parameters += `&limit=${limit}`;
        } else if (ctx.query.limit) {
            const eachLimit = Number.parseInt(ctx.query.limit / feedsList.length);
            if (eachLimit) {
                limit = eachLimit;
            } else {
                limit = 1;
                ctx.query.limit = feedsList.length;
            }
            parameters += `&limit=${limit}`;
        }

        await Promise.all(
            feedsList.map(async (feed) => {
                const url = `${instance}/v1/feeds/${feed}/entries?${parameters}`;
                const response = await got({
                    method: 'get',
                    url,
                    headers: {
                        'X-Auth-Token': token,
                    },
                });

                const entries = response.data.entries;
                // Whether or not get the title of this feed
                let getFeedTitle = 0;
                // entries.map(item => {
                for (const entry of entries) {
                    entriesID.push(entry.id);
                    if (!getFeedTitle) {
                        feedsName.push(entry.feed.title);
                        getFeedTitle = 1;
                    }
                    // Whether or not user would like to add the feed's name
                    // to the title of article.
                    let entryTitle = entry.title;
                    if (addFeedName) {
                        entryTitle += ` | ${entry.feed.title}`;
                    }
                    // let entryURL = `${instance}/share/${entry.share_code}`;
                    // if (link == 'original') {
                    //     entryURL = entry.url;
                    // }
                    articles.push({
                        title: entryTitle,
                        author: entry.author,
                        pubDate: entry.published_at,
                        description: entry.content,
                        link: entry.url,
                    });
                }
            })
        );

        const feedsNumber = feedsName.length;
        let agTitle, agInfo;
        if (feedsNumber > 2) {
            agTitle = `MiniFlux | Aggregator For ${feedsNumber} Feeds`;
            agInfo = 'An aggregator powered by MiniFlux and RSSHub. ' + 'This aggregator truthfully preserves the contents in ' + `${feedsNumber} feeds, including: ` + `<li>${feedsName.join('<li></li>')}</li>`;
        } else if (feedsNumber) {
            agTitle = `MiniFlux | ${feedsName.join(', ')}`;
            agInfo = 'A RSS feed powered by MiniFlux and RSSHub ' + 'effortlessly republishes the contents in ' + `"${feedsName.join('" & "')}".`;
        } else {
            agTitle = `MiniFlux | Feeds Aggregator`;
            agInfo = 'An aggregator powered by MiniFlux and RSSHub ' + 'with empty content. If this is not your intention, ' + `please double-check your setting for parameters.`;
        }

        ctx.state.data = {
            title: agTitle,
            link: instance,
            description: agInfo,
            item: articles,
            allowEmpty: true,
        };
    } else {
        if (limit && ctx.query.limit) {
            if (limit < ctx.query.limit) {
                ctx.query.limit = limit;
            }
            // Here we could add a '&' since parameter(s) list must not empty.
            parameters += `&limit=${ctx.query.limit}`;
        } else if (ctx.query.limit) {
            parameters += `&limit=${ctx.query.limit}`;
        } else if (limit) {
            parameters += `&limit=${limit}`;
        }

        const response = await got.get(`${instance}/v1/entries?${parameters}`, {
            headers: { 'X-Auth-Token': token },
        });

        const entries = response.data.entries;
        const articles = [];
        for (const entry of entries) {
            entriesID.push(entry.id);
            let entryTitle = entry.title;
            if (addFeedName) {
                entryTitle += ` | ${entry.feed.title}`;
            }
            // let entryURL = `${instance}/share/${entry.share_code}`;
            // if (link == 'original') {
            //     entryURL = entry.url;
            // }
            articles.push({
                title: entryTitle,
                author: entry.author,
                pubDate: entry.published_at,
                description: entry.content,
                link: entry.url,
            });
        }

        ctx.state.data = {
            title: `MiniFlux | All`,
            link: instance,
            description: `All feeds on ${instance} powered by MiniFlux`,
            item: articles,
            allowEmpty: true,
        };
    }

    if (mark !== 'unchanged') {
        got({
            method: 'put',
            url: `${instance}/v1/entries`,
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': token,
            },
            json: {
                entry_ids: entriesID,
                status: mark,
            },
        });
    }
};
