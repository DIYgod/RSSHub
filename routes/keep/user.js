const axios = require('axios');
const cheerio = require('cheerio');

const keep_project_and_duration = (text) => {
    const project = text
        .split(', ', 1)
        .toString()
        .trim()
        .slice(2)
        .trim();
    const duration = text
        .split(', ')
        .splice(1)
        .join(', ');
    if (duration) {
        return `项目：${project}<br>时长：${duration}<br>`;
    } else {
        return `项目：${project}<br>`;
    }
};

const keep_item_description = (item) => {
    let description = '';
    description += keep_project_and_duration(item.find('.title').text());
    const comment = item.find('.diary-cont').text();
    if (comment) {
        description += `备注：${comment}<br>`;
    }
    const location = item.find('.location').text();
    if (location) {
        description += `地点：${item.find('.location').text()}<br>`;
    }

    description += item.find('.diary-img');
    return description;
};

const keep_item_date = (item) => {
    const time = item.find('.diary-time').text();
    const matches = /20\d{2}\/\d{2}\/\d{2}/g.exec(item.find('.diary-img').attr('src'));
    if (!matches) {
        return new Date(time).toUTCString();
    }
    return new Date(matches + ' ' + time).toUTCString();
};

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const requestUrl = `https://show.gotokeep.com/usersfulldiary?userId=${id}`;

    const response = await axios({
        method: 'get',
        url: requestUrl,
        headers: {
            Host: 'show.gotokeep.com',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const userName = $('.user-name').text();
    const list = $('a.diary-right');

    ctx.state.data = {
        title: `Keep 运动日记 - ${userName}`,
        link: requestUrl,
        description: $('meta[name="description"]').attr('content'),
        language: 'zh-cn',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.title').text(),
                        pubDate: keep_item_date(item),
                        link: `https://show.gotokeep.com${item.attr('href')}`,
                        description: keep_item_description(item),
                    };
                })
                .get(),
    };
};
