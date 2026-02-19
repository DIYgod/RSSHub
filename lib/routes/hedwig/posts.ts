import { load } from 'cheerio';
import MarkdownIt from 'markdown-it';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { isValidHost } from '@/utils/valid-host';

const md = MarkdownIt({
    html: true,
});

export const route: Route = {
    path: '/posts/:site',
    categories: ['blog'],
    example: '/posts/walnut',
    parameters: { site: '站点名，原则上只要是 `{site}.hedwig.pub` 都可以匹配' },
    features: {
        supportRadar: false,
    },
    name: 'Posts',
    url: 'hedwig.pub',
    maintainers: ['zwithz', 'GetToSet'],
    view: ViewType.Articles,
    handler: async (ctx) => {
        const { site } = ctx.req.param();

        if (!isValidHost(site)) {
            throw new InvalidParameterError('Invalid site');
        }

        const baseUrl = `https://${site}.hedwig.pub`;

        const response = await ofetch(baseUrl);
        const $ = load(response);

        const text = $('script#__NEXT_DATA__').text();
        const json = JSON.parse(text);

        const pageProps = json.props.pageProps;

        const list = pageProps.issuesByNewsletter.map((item) => {
            const description = item.blocks.reduce((desc, block) => desc + md.render(block.markdown.text), '');
            return {
                title: item.subject,
                description,
                pubDate: timezone(parseDate(item.publishAt, 'YYYY-MM-DDTHH:mm:ss.SSS[Z]'), +0),
                link: `${baseUrl}/i/${item.urlFriendlyName}`,
            };
        });

        return {
            title: pageProps.newsletter.name,
            description: pageProps.newsletter.about,
            link: baseUrl,
            item: list,
        };
    },
};
