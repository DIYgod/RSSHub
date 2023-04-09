const cheerio = require('cheerio');
const path = require('path');

const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { art } = require('@/utils/render');
const { parseDate } = require('@/utils/parse-date');

const baseURL = 'https://www.huiyankan.com/';

module.exports = async (ctx) => {
    const path = '/' + [ctx.params.category, ctx.params.subcategory].filter(Boolean).join('/');
    const feed = path === '/' ? new HomePageFeed() : new CategoryPageFeed(path);

    ctx.state.data = await feed.dump();
};

async function loadPage(url) {
    return cheerio.load((await got({ method: 'get', url })).data);
}

class Feed {
    constructor(sourcePageURL) {
        this.sourcePageURL = sourcePageURL;
    }

    async dump() {
        const $ = await loadPage(this.sourcePageURL);

        return {
            $cheerioObject: $, // passed down to subclasses for reuse
            link: this.sourcePageURL,
            description: $('meta[name=description]').attr('content'),
        };
    }
}

class HomePageFeed extends Feed {
    constructor() {
        super(baseURL);
    }

    async dump() {
        const { $cheerioObject: $, ...feedData } = await super.dump();

        // On the home page, only a small number of recently updated items are
        // selected and presented, therefore I'd like to dig into the individual
        // category pages for more book posts.  Note that only the first-level
        // categories (currently only four) are necessary, because they should
        // already contain all books including those in the subcategories.
        const childFeeds = await Promise.all(
            $('ul.nav-menu > li > a[href$=/]') // excluding hyperlinks like `/hejitaozhuang.html`
                .toArray()
                .map((a) => new CategoryPageFeed($(a).attr('href')).dump())
        );

        return Object.assign(feedData, {
            title: '慧眼看 - 所有分类',
            item: childFeeds
                .map((data) => data.item)
                .flat()
                .sort((a, b) => b.pubDate - a.pubDate),
        });
    }
}

class CategoryPageFeed extends Feed {
    constructor(pageLocation) {
        super(pageLocation.startsWith('/') ? new URL(pageLocation, baseURL).href : pageLocation);
    }

    async dump() {
        const { $cheerioObject: $, ...feedData } = await super.dump();

        const breadcrumbs = $('nav.bread a')
            .toArray()
            .map((a) => $(a).text());
        breadcrumbs[0] = '慧眼看'; // replacing the leading crumb: '首页'

        return Object.assign(feedData, {
            title: breadcrumbs.join(' - '),
            item: $('article')
                .toArray()
                .map((elem) => buildPostItem($(elem), $)),
        });
    }
}

function buildPostItem(article, $) {
    const postLink = article.find('.entry-title > a');
    const postDate = timezone(parseDate(article.find('.date').text(), +8));

    return {
        title: postLink.text(),
        link: postLink.attr('href'),
        description: art(path.join(__dirname, 'templates/desc.art'), {
            imageURL: new URL(article.find('figure img').attr('data-original')).searchParams.get('src'),
            descriptionText: article.find('.archive-content').text().trim(),
            postDate: postDate.toLocaleDateString('zh-CN'),
        }),
        category: article
            .find('.cat > a')
            .toArray()
            .map((elem) => $(elem).text()),
        pubDate: postDate,
    };
}
