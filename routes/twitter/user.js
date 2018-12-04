const Twit = require('twit');
const config = require('../../config');

const T = new Twit(config.twitter);

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const formatText = (text) => text.replace(/https:\/\/t\.co(.*)/g, '');
    const formatMedia = (item) => {
        let img = '';
        item.extended_entities &&
            item.extended_entities.media.forEach((item) => {
                img += `<br>${item.type === 'video' ? 'Video: ' : ''}<img referrerpolicy="no-referrer" src="${item.media_url_https}">`;
            });

        return img;
    };
    const formatUrl = (item) => {
        let url = '';
        item.entities.urls.forEach((u) => {
            url += `<a href="${u.expanded_url}" target="_blank">${u.expanded_url}</a>`;
        });

        return url;
    };

    const result = await T.get('statuses/user_timeline', {
        screen_name: id,
        tweet_mode: 'extended',
    });

    const data = result.data;

    ctx.state.data = {
        title: `${data[0].user.name} 的 Twitter`,
        link: `https://twitter.com/${id}/`,
        description: data[0].user.description,
        item: data.map((item) => {
            item = item.retweeted_status || item;
            item.full_text = formatText(item.full_text);
            const img = formatMedia(item);
            let url = '';
            let quote = '';

            if (item.is_quote_status) {
                const quoteData = item.quoted_status;

                if (quoteData) {
                    const author = quoteData.user;
                    quote += `<br><br>${author.name}: ${formatText(quoteData.full_text)}<br>`;
                    quote += formatMedia(quoteData);
                    quote += formatUrl(quoteData);
                } else {
                    url = formatUrl(item);
                }
            } else {
                url = formatUrl(item);
            }

            return {
                title: `${item.in_reply_to_screen_name ? 'Re ' : ''}${item.full_text}`,
                description: `${item.in_reply_to_screen_name ? 'Re ' : ''}${item.full_text}${url}${img}${quote}`,
                pubDate: new Date(item.created_at).toUTCString(),
                link: `https://twitter.com/${id}/status/${item.id_str}`,
            };
        }),
    };
};
