const axios = require('axios');
const art = require('art-template');
const path = require('path');
const config = require('../../config');

module.exports = async (ctx) => {
    const owner = ctx.params.owner;
    const repo = ctx.params.repo;

    const response = await axios({
        method: 'get',
        url: `https://api.github.com/repos/${owner}/${repo}/releases`,
        headers: {
            'User-Agent': config.ua,
        }
    });

    const data = await Promise.all(response.data.map(async (item) => {
        let text = item.body;
        if (text) {
            // render github flavoured markdown
            const resp = await axios({
                method: 'post',
                url: 'https://api.github.com/markdown',
                data: {
                    text,
                    mode: 'gfm',
                    context: `${owner}/${repo}`,
                },
            });
            text = resp.data;
        }
        return {
            title: `${item.name || item.tag_name}`,
            description: text,
            pubDate: new Date(item.published_at).toUTCString(),
            link: item.html_url,
        };
    }));

    ctx.body = art(path.resolve(__dirname, '../../views/rss.art'), {
        title: `${owner}/${repo} 的 Releases`,
        link: `https://github.com/${owner}/${repo}/releases`,
        description: `${owner}/${repo} 的 Releases`,
        lastBuildDate: new Date().toUTCString(),
        item: data,
    });
};
