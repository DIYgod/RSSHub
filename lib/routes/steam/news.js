const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { appid, language = 'schinese' } = ctx.params;
    const response = await got.get(`https://store.steampowered.com/news/app/${appid}`, {
        headers: {
            cookie: `Steam_Language=${language}`,
        },
    });
    const $ = cheerio.load(response.data);
    const { events } = JSON.parse($('#application_config').attr('data-initialevents'));

    const item = events.map((event) => {
        event.announcement_body.body = event.announcement_body.body
            .replace(/\[img]\{STEAM_CLAN_IMAGE}/g, '<img noopener noreferer style="max-width:100%;" src="https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/clans')
            .replace(/\[\/img]/g, '"/>')
            .replace(/\[h1]/g, '<h1>')
            .replace(/\[\/h1]/g, '</h1>')
            .replace(/\[h2]/g, '<h2>')
            .replace(/\[\/h2]/g, '</h2>')
            .replace(/\[b]/g, '<b>')
            .replace(/\[\/b]/g, '</b>')
            .replace(/\[i]/g, '<i>')
            .replace(/\[\/i]/g, '</i>')
            .replace(/\[url=\s?(http.*?)]/g, '<a href="$1">')
            .replace(/\[\/url]/g, '</a>')
            .replace(/\[list]/g, '<ul>')
            .replace(/\[\/list]/g, '</ul>')
            .replace(/\[\*]/g, '<li>');

        return {
            title: event.event_name,
            link: `https://store.steampowered.com/news/app/${appid}/view/${event.gid}`,
            pubDate: new Date(event.announcement_body.posttime * 1000),
            description: event.announcement_body.body,
        };
    });

    ctx.state.data = {
        title: $('head title').text(),
        link: `https://store.steampowered.com/news/app/${appid}`,
        item,
    };
};
