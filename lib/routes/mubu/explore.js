const got = require('@/utils/got');

module.exports = async (ctx) => {
    const tagId = ctx.params.tagId;
    const response = await got({
        method: 'post',
        url: `https:mubu.com/api/community/query_document`,
        form: {
            page: 1,
            tagId,
            title: '',
            type: '',
            docRecommend: '',
        },
        headers: {
            referer: 'https:mubu.com/explore',
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
                        .map((pic) => `https://api2.mubu.com/v3/${pic.uri}`)
                        .map((uri) => `<div style="text-align: center;"><img src="${uri}" style="max-width: 100%;object-fit: contain;" /></div>`)
                        .join('');
                }

                return `<li>${node.text}${ele}</li>`;
            })
            .join('');

        return `<ul>${list}</ul>`;
    };

    const item = await Promise.all(
        response.data.data.rows.slice(0, 20).map((item) =>
            ctx.cache.tryGet(`https://mubu.com/doc/explore/${item.id}`, async () => {
                const res = await got({
                    method: 'post',
                    url: `https://api2.mubu.com/v3/api/document/view/get`,
                    json: {
                        docId: item.documentId,
                    },
                    headers: {
                        referer: 'https://mubu.com/',
                    },
                });
                const content = JSON.parse(res.data.data.definition);
                const description = h(content.nodes);

                return {
                    title: item.title,
                    link: `https://mubu.com/doc/explore/${item.id}`,
                    description: `<style>.bold{font-weight:bold;}</style>${description}`,
                };
            })
        )
    );

    ctx.state.data = {
        title: '幕布',
        link: `https://mubu.com/explore#${tagId}`,
        item,
    };
};
