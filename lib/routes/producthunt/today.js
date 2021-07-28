const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got.get('https://www.producthunt.com/');

    const data = JSON.parse(response.data.match(/(?<=window\.__APOLLO_STATE__ =)(.*?)(?=;<\/script>)/)[0]);

    const list = Object.values(data).filter((o) => o.__typename === 'Post');

    ctx.state.data = {
        title: 'Product Hunt Today Popular',
        link: 'https://www.producthunt.com/',
        item: list.map((l) => {
            const img = l.thumbnail ? `https://ph-files.imgix.net/${data[l.thumbnail.id].image_uuid}?auto=format&auto=compress&codec=mozjpeg&cs=strip&w=150&h=150&fit=crop` : '';

            return {
                title: l.name,
                description: `${l.tagline}<br>${img === '' ? '' : `<img src="${img}">`}`,
                link: 'https://www.producthunt.com/posts/' + l.slug,
                pubDate: new Date(l.updated_at),
            };
        }),
    };
};
