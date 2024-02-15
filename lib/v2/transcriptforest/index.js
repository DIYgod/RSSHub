const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { channel } = ctx.params;
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 30;

    const rootUrl = 'https://www.transcriptforest.com';

    const { data: firstResponse } = await got(rootUrl);

    const data = JSON.parse(firstResponse.match(/({"props".*"scriptLoader":\[]})<\/script>/)?.[1]);

    const buildId = data.buildId;
    const defaultLocale = data.defaultLocale;
    const channels = data.props.pageProps.listChannel;
    const selected = channel ? channels.find((c) => c.channel_id === channel || c.channel_name === channel) : undefined;

    const apiUrl = new URL(`_next/data/${buildId}/en${selected ? `/channel/${selected.channel_id}` : ''}.json`, rootUrl).href;
    const currentUrl = new URL(selected ? `${defaultLocale}/channel/${selected.channel_id}` : '', rootUrl).href;

    const { data: response } = await got(apiUrl, {
        searchParams: {
            channelName: selected ? selected.channel_id : '',
            offset: 0,
        },
    });

    const items = response.pageProps.listEpisode.data.slice(0, limit).map((item) => ({
        title: item.episode_name,
        link: new URL(`${defaultLocale}/${item.channel_id}/${item.episode_id}`, rootUrl).href,
        description: art(path.join(__dirname, 'templates/description.art'), {
            audios: [
                {
                    src: item.source_media,
                    type: 'audio/mpeg',
                },
            ],
            description: item.episode_description,
        }),
        author: item.channel_name,
        guid: item.id,
        pubDate: parseDate(item.published_at),
        updated: parseDate(item.updated_at),
        itunes_item_image: item.episode_cover.split(/\?/)[0],
        itunes_duration: item.episode_duration,
        enclosure_url: item.source_media,
        enclosure_type: 'audio/mpeg',
    }));

    const { data: currentResponse } = await got(currentUrl);

    const $ = cheerio.load(currentResponse);

    const title = $('title').text();
    const image = $('meta[property="og:image"]').prop('content');
    const icon = new URL($('link[rel="apple-touch-icon"]').prop('href'), rootUrl).href;
    const author = title.split(/\|/)[0].trim();

    ctx.state.data = {
        item: items,
        title,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: $('html').prop('lang'),
        image,
        icon,
        logo: icon,
        author,
        itunes_author: author,
        allowEmpty: true,
    };
};
