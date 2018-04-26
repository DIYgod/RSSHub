const axios = require('axios');
const art = require('art-template');
const path = require('path');
const marked = require('marked');
const config = require('../../config');

marked.setOptions({
    gfm: true,
    breaks: true,
    tables: true
});

const limit = 10;

const headers = {
    'User-Agent': config.ua,
};
if (config.github_token) {
    headers.Authorization = `token ${config.github_token}`;
}

const session = axios.create({
    headers,
    baseURL: 'https://api.github.com/',
});

module.exports = async (ctx) => {
    const owner = ctx.params.owner;
    const repo = ctx.params.repo;

    const response = await session.get(`repos/${owner}/${repo}/releases?per_page=${limit}`);

    ctx.body = art(path.resolve(__dirname, '../../views/rss.art'), {
        title: `${owner}/${repo} 的 Releases`,
        link: `https://github.com/${owner}/${repo}/releases`,
        description: `${owner}/${repo} 的 Releases`,
        lastBuildDate: new Date().toUTCString(),
        item: response.data.map((item) => ({
            title: item.name || item.tag_name,
            description: marked(item.body || ''),
            pubDate: new Date(item.published_at).toUTCString(),
            link: item.html_url,
        })),
    });
};

// vim:set sta et sw=4 ts=4 sts=4:
