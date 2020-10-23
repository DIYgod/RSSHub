const got = require('@/utils/got');

module.exports = async (ctx) => {
    ctx.params.category_name = ctx.params.category_name || 'humans-and-technology';

    const response = await got.get(`https://wp.technologyreview.com/wp-json/irving/v1/data/term_archive?category_name=${ctx.params.category_name}&apge=${ctx.params.page}`);

    ctx.state.data = {
        title: 'Technology Review',
        link: 'https://www.technologyreview.com/',
        item: response.data.map((item) => ({
            title: item.config.title,
            description: item.config.postDate,
            link: item.config.permalink,
        })),
    };
};
