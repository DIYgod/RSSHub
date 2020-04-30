const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.nintendo.com/games/voucher-compatible-games/',
    });
    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('ul.games-curated-list li').get();

    const game = list.map((item) => {
        const $ = cheerio.load(item);
        const game = $(item).find('a').html();
        return {
            games: `<td>${game}</td>`,
        };
    });

    const gamelistdata = [];
    let gamelist = '';
    if (game.length > 3) {
        for (let i = 0; i < game.length; i += 3) {
            gamelistdata.push(game.slice(i, i + 3));
        }
        for (let p = 0; p < gamelistdata.length; p++) {
            gamelist += `<tr>${gamelistdata[p][0].games}${gamelistdata[p][1].games ? gamelistdata[p][1].games : ''}${gamelistdata[p][2].games ? gamelistdata[p][2].games : ''}</tr>`;
        }
    }

    ctx.state.data = {
        title: `Nintendo Switch Game Vouchers`,
        link: `https://www.nintendo.com/games/voucher-compatible-games/`,
        description: `Nintendo Switch 游戏抵用券支持兑换的游戏`,
        item: [
            {
                title: `${game.length} games voucher compatible!`,
                description: `<table><th colspan="3">Nintendo Switch Game Vouchers<tr></tr></th>${gamelist}</table>`,
                link: 'https://www.nintendo.com/games/voucher-compatible-games/',
            },
        ],
    };
};
