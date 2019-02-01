const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = {
    getData: async (name, url) => {
        const response = await axios({
            method: 'get',
            url: url,
            headers: {
                Referer: url,
            },
        });

        const data = response.data;

        const $ = cheerio.load(data);
        const list = $('ol.dribbbles.group li.group');

        return {
            title: `${name} - Dribbble`,
            link: url,
            description: $('meta[name="description"]').attr('content'),
            item:
                list &&
                list
                    .map((index, item) => {
                        item = $(item);
                        return {
                            title: item.find('.dribbble-over strong').text(),
                            description: `<img referrerpolicy="no-referrer" src="${item
                                .find('.dribbble-link img')
                                .attr('src')
                                .replace('_teaser', '')}"><br>
                                ${item.find('.comment').text()}<br>
                                <strong>Author:</strong> ${item.find('.attribution-team') ? item.find('.attribution-team').text() + ' -' : ''}${item.find('.attribution-user').text()}<br>
                                <strong>Views:</strong> ${item.find('.views').text()}<br>
                                <strong>Comment:</strong> ${item.find('.cmnt').text()}<br>
                                <strong>Favor:</strong> ${item.find('.fav').text()}`,
                            link: `https://dribbble.com${item.find('.animated-target').attr('href') ||
                                item
                                    .find('.extras > a')
                                    .attr('href')
                                    .replace('/rebounds', '')}`,
                        };
                    })
                    .get(),
        };
    },
};
