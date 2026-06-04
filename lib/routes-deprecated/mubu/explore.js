const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const title = ctx.params.title || '';
    const category = ctx.params.category || '0';

    const rootUrl = 'https://mubu.com';
    const apiUrl = 'https://api2.mubu.com';
    const exploreUrl = `${apiUrl}/v3/api/explore/get_explore_doc_list`;
    const documentUrl = `${apiUrl}/v3/api/explore/get`;

    const response = await got({
        method: 'post',
        url: exploreUrl,
        json: {
            categoryId: '3',
            pageSize: '20',
            start: '',
            type: category === '0' ? 0 : 1,
        },
    });

    const h = (nodes) => {
        const list = nodes
            .map((node) => {
                let ele = '';
                if (Array.isArray(node.children)) {
                    ele = h(node.children);
                }
                if (Array.isArray(node.images)) {
                    ele += node.images
                        .map((pic) => `${apiUrl}/v3/${pic.url}`)
                        .map((url) => `<div style="text-align: center;"><img src="${url}" style="max-width: 100%;object-fit: contain;" /></div>`)
                        .join('');
                }

                return `<li>${node.text}${ele}</li>`;
            })
            .join('');

        return `<ul>${list}</ul>`;
    };

    const items = await Promise.all(
        response.data.data.rows.slice(0, 20).map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'post',
                    url: documentUrl,
                    json: {
                        exploreDocId: item.exploreDocId,
                    },
                });
                const content = JSON.parse(detailResponse.data.data.definition);
                const description = h(content.nodes);

                const $ = cheerio.load(description);
                $('.bold').css('font-weight', 'bold');
                $('.text-color-red').css('color', '#dc2d1e');

                return {
                    title: item.title,
                    author: item.userName,
                    pubDate: new Date(item.submitTime),
                    link: `${rootUrl}/explore/${item.exploreDocId}`,
                    description: `<h2>${item.title}</h2>` + $('*').html(),
                };
            })
        )
    );

    ctx.state.data = {
        title: `${title ? `${title} - ` : ''}幕布精选社区`,
        link: `${rootUrl}/explore?categoryId=${category}`,
        item: items,
    };
};
