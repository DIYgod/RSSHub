// @ts-nocheck
import got from '@/utils/got';
import { config } from '@/config';
import queryString from 'query-string';

export default async (ctx) => {
    const user = ctx.req.param('user');

    const headers = {};
    if (config.github && config.github.access_token) {
        headers.Authorization = `token ${config.github.access_token}`;
    }
    const response = await got({
        method: 'get',
        url: `https://api.github.com/users/${user}/repos`,
        searchParams: queryString.stringify({
            sort: 'created',
        }),
        headers,
    });
    const data = response.data;
    ctx.set('data', {
        allowEmpty: true,
        title: `${user}'s GitHub repositories`,
        link: `https://github.com/${user}`,
        item:
            data &&
            data.map((item) => ({
                title: item.name,
                description: item.description || 'No description',
                pubDate: new Date(item.created_at).toUTCString(),
                link: item.html_url,
            })),
    });
};
