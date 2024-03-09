import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import * as path from 'node:path';
import MarkdownIt from 'markdown-it';
const md = MarkdownIt({
    html: true,
});
import { load } from 'cheerio';

art.defaults.imports.render = function (string) {
    return md.render(string);
};

export const route: Route = {
    path: ['/month', '/volume'],
    name: 'Unknown',
    maintainers: ['moke8', 'nczitzk'],
    handler,
};

async function handler() {
    const rootUrl = 'https://hellogithub.com';
    const apiUrl = 'https://api.hellogithub.com/v1/periodical/';

    const periodicalResponse = await got({
        method: 'get',
        url: apiUrl,
    });
    const current = periodicalResponse.data.volumes[0].num;
    const currentUrl = `${rootUrl}/periodical/volume/${current}`;
    const buildResponse = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(buildResponse.data);

    const text = $('#__NEXT_DATA__').text();
    const response = JSON.parse(text);
    const data = response.props;
    const id = data.pageProps.volume.current_num;

    const items = [
        {
            title: `No.${id}`,
            link: `${rootUrl}/periodical/volume/${id}`,
            description: art(path.join(__dirname, 'templates/volume.art'), {
                data: data.pageProps.volume.data,
            }),
        },
    ];

    return {
        title: 'HelloGithub - 月刊',
        link: currentUrl,
        item: items,
    };
}
