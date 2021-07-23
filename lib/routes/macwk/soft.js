const got = require('@/utils/got');
const queryString = require('query-string');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const name = ctx.params.name;
    const url = `https://api.macwk.com/api/items/soft?${queryString.stringify({
        'filter[slug][eq]': name,
        fields: 'id,title,description',
    })}`;
    const res = await got.get(url);
    const data = res.data.data[0];
    const versionsRes = await got.get(
        `https://api.macwk.com/api/items/soft_version?${queryString.stringify({
            'filter[softid][eq]': data.id,
        })}`
    );
    const items = versionsRes.data.data.map((item) => ({
        title: `${data.title} ${item.version}`,
        pubDate: parseDate(item.created_on, 'YYYY/MM/DD HH:mm:ss'),
        description: item.download.reduce((desc, download) => `${desc}<a href="${download.url}">${download.name}</a>${download.password ? `<p>密码：${download.password}</p>` : ''}<br>`, ''),
        link: `https://macwk.com/soft/${name}`,
        guid: `${name} ${item.version}`,
    }));

    ctx.state.data = {
        title: `${data.title} 的软件更新`,
        link: `https://macwk.com/soft/${name}`,
        description: data.description,
        item: items,
    };
};
