// @ts-nocheck
import got from '@/utils/got';
import { config } from '@/config';
import queryString from 'query-string';

export default async (ctx) => {
    const user = ctx.req.param('user');
    const repo = ctx.req.param('repo');
    const branch = ctx.req.param('branch');
    const filepath = ctx.req.param('filepath');

    const fileUrl = `https://github.com/${user}/${repo}/commits/${branch}/${filepath}`;

    const headers = {};
    if (config.github && config.github.access_token) {
        headers.Authorization = `token ${config.github.access_token}`;
    }
    const res = await got.get(`https://api.github.com/repos/${user}/${repo}/commits`, {
        searchParams: queryString.stringify({
            sha: branch,
            path: filepath,
        }),
        headers,
    });
    const list = res.data;
    const count = [];
    for (let i = 0; i < Math.min(list.length, 10); i++) {
        count.push(i);
    }
    const resultItems = count.map((i) => {
        const each = list[i];
        return {
            title: each.commit.message.split('\n')[0],
            description: `<pre>${each.commit.message}</pre>`,
            link: each.html_url,
            author: each.commit.author.name,
            pubDate: new Date(each.commit.committer.date).toUTCString(),
        };
    });

    ctx.set('data', {
        title: `GitHub File - ${user}/${repo}/${branch}/${filepath}`,
        link: fileUrl,
        item: resultItems,
    });
};
