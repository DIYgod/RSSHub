import got from '~/utils/got.js';
import cheerio from 'cheerio';
import markdownIt from 'markdown-it';

const md = markdownIt({
    html: true,
});

import dayjs from 'dayjs';

export default async (ctx) => {
    const {
        type
    } = ctx.params;

    const url = `https://${type}.hedwig.pub`;
    const res = await got({
        method: 'get',
        url,
    });
    const $ = cheerio.load(res.data);
    const content = JSON.parse($('#__NEXT_DATA__')[0].children[0].data);
    const title = $('title').text();

    const list = content.props.pageProps.issuesByNewsletter.map((item) => {
        let description = '';
        for (const block of item.blocks) {
            description += md.render(block.markdown.text);
        }
        return {
            title: item.subject,
            description,
            pubDate: dayjs(`${item.publishAt} +0800`, `YYYY-MM-DD'T'HH:mm:ss.SSS'Z'`).toString(),
            link: `https://${type}.hedwig.pub/i/${item.urlFriendlyName}`,
        };
    });
    ctx.state.data = {
        title: `Ⓙ Hedwig - ${title}`,
        description: content.props.pageProps.newsletter.about,
        link: `https://${type}.hedwig.pub`,
        item: list,
    };
};
