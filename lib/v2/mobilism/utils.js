const dayjs = require('dayjs');
const { default: got } = require('got/dist/source');

const firstUpperCase = (str) => str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());

const patterns = [
    {
        regexp: /less than a minute ago/,
        handler: () => dayjs().add(1, 'm'),
    },
    {
        regexp: /(\d+) minutes? ago/,
        handler: (minute) => dayjs().subtract(minute, 'minutes'),
    },
    {
        regexp: /Today, (\d+:\d+\s(am|pm))/,
        handler: (hm) => dayjs(hm || '0:00 am', ['hh:m a', 'hh:mm a', 'h:m a', 'h:mm a']),
    },
    {
        regexp: /Yesterday, (\d+:\d+\s(am|pm))/,
        handler: (hm) => dayjs(hm || '0:00 am', ['hh:m a', 'hh:mm a', 'h:m a', 'h:mm a']).subtract(1, 'day'),
    },
];

const parseDate = (date) => {
    for (const pattern of patterns) {
        const match = pattern.regexp.exec(date);
        if (match !== null) {
            if (match.length === 1) {
                return dayjs().set('s', 0).toDate();
            } else {
                return pattern.handler(match[1]).set('s', 0).toDate();
            }
        }
    }
    return dayjs(date, 'MMM Do, YYYY, h:mm a').set('s', 0).toDate();
};

const login = async () => {
    const res = await got.post('https://forum.mobilism.org/ucp.php?mode=login', {
        form: {
            username: 'Nite07',
            password: 'hjwqgToCkGza2Y',
            login: 'Login',
            autologin: 'on',
            sid: 'd0fc9abd2dc3148d2b8641f0bb075e64',
        },
    });
    let cookie = '';
    const cookies = res.headers['set-cookie'];
    for (let i = 3; i < cookies.length; i++) {
        const reg = /ppcw_29d3s(.*?);/;
        const res = reg.exec(cookies[i]);
        if (res) {
            cookie += 'ppcw_29d3s' + res[1] + '; ';
        }
    }
    return cookie;
};

module.exports = {
    firstUpperCase,
    parseDate,
    login,
};
