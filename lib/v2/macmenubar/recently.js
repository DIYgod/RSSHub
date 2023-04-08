const path = require('path');
const got = require('@/utils/got');
const { art } = require('@/utils/render');

function renderDescription(item) {
    const categories = item.category.map((raw) => raw.name);
    const tags = item.tag.map((raw) => raw.name);
    return art(path.join(__dirname, 'template/description.art'), {
        title: item.title,
        tags,
        categories,
        content: item.content,
    });
}

module.exports = async (ctx) => {
    const url = 'https://macmenubar.com/wp-json/wp/v2/posts?per_page=100';
    const category = ctx.params.category;
    const response = await got(url);
    const items = response.data
        .filter((post) => post.category_info.some((cat) => category === cat.slug))
        .map((post) => {
            const title = post.title.rendered;
            const link = post.link;
            const pubDate = post.date;
            const description = renderDescription({ title, content: post.content.rendered, tag: post.tag_info, category: post.category_info });
            return {
                title,
                link,
                pubDate,
                description,
            };
        });
    ctx.state.data = {
        title: `${category ? response.data[0].category_info.name : 'All'} Recent Posts | MacMenuBar.com`,
        link: String(url),
        item: items,
    };
};
