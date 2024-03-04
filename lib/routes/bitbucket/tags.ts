// @ts-nocheck
import got from '@/utils/got';
import { config } from '@/config';
import queryString from 'query-string';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const workspace = ctx.req.param('workspace');
    const repo_slug = ctx.req.param('repo_slug');

    const headers = {
        Accept: 'application/json',
    };
    let auth = '';
    if (config.bitbucket && config.bitbucket.username && config.bitbucket.password) {
        auth = config.bitbucket.username + ':' + config.bitbucket.password + '@';
    }
    const response = await got({
        method: 'get',
        url: `https://${auth}api.bitbucket.org/2.0/repositories/${workspace}/${repo_slug}/refs/tags/`,
        searchParams: queryString.stringify({
            sort: '-target.date',
        }),
        headers,
    });
    const data = response.data.values;
    ctx.set('data', {
        allowEmpty: true,
        title: `Recent Tags in ${workspace}/${repo_slug}`,
        link: `https://bitbucket.org/${workspace}/${repo_slug}`,
        item:
            data &&
            data.map((item) => ({
                title: item.name,
                author: item.tagger.raw,
                description: item.message || 'No description',
                pubDate: parseDate(item.date),
                link: item.links.html.href,
            })),
    });
};
