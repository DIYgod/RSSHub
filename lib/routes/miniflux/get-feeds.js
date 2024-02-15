const got = require('@/utils/got');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const instance = config.miniflux.instance;
    const token = config.miniflux.token;

    if (!token) {
        throw new Error('This RSS feed is disabled due to its incorrect configuration: the token is missing.');
    }

    function set(item) {
        if (item.search('=') === -1) {
            return '';
        }
        const filter = item.substring(0, item.indexOf('='));
        const option = item.substring(item.lastIndexOf('=') + 1);
        if (filter.search('categor') !== -1) {
            option.split(',').map((item) => categories.push(item.toString().toLowerCase()));
            return filter;
        }
        if (filter.search('feed') === -1) {
            return '';
        } else {
            option.split(',').map((item) => feeds.push(item.toString().toLowerCase()));
            return filter;
        }
    }

    function addFeed(item) {
        subscription.push({
            title: item.title,
            link: item.site_url,
            pubData: item.last_modified_header,
            description: 'Feed URL: ' + `<a href=${item.feed_url}>${item.feed_url}</a>`,
        });
    }

    const response = await got.get(`${instance}/v1/feeds`, {
        headers: { 'X-Auth-Token': token },
    });

    const subscription = [];
    const categories = [];
    const feeds = [];
    const feedsList = response.data;

    const parameters = ctx.params.parameters
        ?.split('&')
        .map((parameter) => set(parameter))
        .join('');

    if (parameters) {
        for (const item of feedsList) {
            if (categories.length && feeds.length) {
                const categoryTitle = item.category.title.toLowerCase();
                const categoryID = item.category.id.toString();
                const feedID = item.id.toString();
                const feedTitle = item.title.toLowerCase();
                if ((categories.includes(categoryID) || categories.includes(categoryTitle)) && (feeds.includes(feedID) || feeds.includes(feedTitle))) {
                    addFeed(item);
                }
            } else if (categories.length) {
                const categoryTitle = item.category.title.toLowerCase();
                const categoryID = item.category.id.toString();
                if (categories.includes(categoryID) || categories.includes(categoryTitle)) {
                    addFeed(item);
                }
            } else if (feeds.length) {
                const feedID = item.id.toString();
                const feedTitle = item.title.toLowerCase();
                if (feeds.includes(feedID) || feeds.includes(feedTitle)) {
                    addFeed(item);
                }
            }
        }
    } else {
        for (const item of feedsList) {
            addFeed(item);
        }
    }

    ctx.state.data = {
        title: `MiniFlux | Subscription List`,
        link: instance,
        description: `A subscription tracking feed.`,
        item: subscription,
        allowEmpty: true,
    };
};
