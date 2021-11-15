import got from '~/utils/got.js';
import {createCommons} from 'simport';

const {
    require
} = createCommons(import.meta.url);

const config = require('~/config').value;
const queryString = require('query-string');

export default async (ctx) => {
    const {
        user
    } = ctx.params;

    const headers = {};
    if (config.github?.access_token) {
        headers.Authorization = `token ${config.github.access_token}`;
    }
    const {
        data
    } = await got({
        method: 'get',
        url: `https://api.github.com/users/${user}/repos`,
        searchParams: queryString.stringify({
            sort: 'created',
        }),
        headers,
    });
    ctx.state.data = {
        allowEmpty: true,
        title: `${user}'s GitHub repositories`,
        link: `https://github.com/${user}`,
        item:
            data?.map((item) => ({
                title: item.name,
                description: item.description || 'No description',
                pubDate: new Date(item.created_at).toUTCString(),
                link: item.html_url,
            })),
    };
};
