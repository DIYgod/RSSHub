const got = require('@/utils/got');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const user = ctx.params.user;
    const repo = ctx.params.repo;
    const order = ctx.params.order;
    const anon = ctx.params.anon;

    const host = `https://github.com/${user}/${repo}`;
    const url = `https://api.github.com/repos/${user}/${repo}/contributors?` + (anon ? 'anon=1' : '');

    const headers = {};
    if (config.github && config.github.access_token) {
        headers.Authorization = `token ${config.github.access_token}`;
    }

    const response = await got({
        method: 'get',
        url,
        headers,
    });
    let data = response.data;

    try {
        const last_page_link = response.headers.link.split(',').find(function(elem) {
            return elem.includes('"last"');
        });
        const url_base = last_page_link.match(/<(.*)page=\d*/)[1];
        const page_count = Number(last_page_link.match(/page=(\d*)/)[1]);

        for (let page = 2; page <= page_count; page++) {
            // eslint-disable-next-line no-await-in-loop
            const response = await got({
                method: 'get',
                url: `${url_base}page=${page}`,
                headers,
            });
            data = data.concat(response.data);
        }
    } catch (err) {
        if (!(err instanceof TypeError)) {
            throw err;
        }
    }

    let title;
    let description;
    let link;
    let guid;

    const items = [];
    let index = 0;

    data.forEach(function(item) {
        const time = new Date();
        time.setMinutes(time.getMinutes() + (order === 'asc' ? -data.length + index : -index));
        index++;

        if (item.type === 'Anonymous') {
            title = `Contributor: ${item.name}`;
            description = `<p>Anonymous contributor</p><p>Name: ${item.name}</p><p>E-mail: ${item.email}</p><p>Contributions: ${item.contributions}</p>`;
            link = '';
            guid = `anon-${item.name}`;
        } else {
            title = `Contributor: ${item.login}`;
            description = `<img src="${item.avatar_url}"></img><p><a href="${item.html_url}">${item.login}</a></p><p>Contributions: ${item.contributions}</p>`;
            link = item.html_url;
            guid = item.id;
        }

        items.push({
            title: title,
            description: description,
            guid: guid,
            link: link,
            pubDate: time,
        });
    }),
        (ctx.state.data = {
            title: `${user}/${repo} Contributors`,
            link: `${host}/graphs/contributors`,
            description: `New contributors for ${user}/${repo}`,
            item: items,
        });
};
