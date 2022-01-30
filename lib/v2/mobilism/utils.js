const got = require('@/utils/got');

const firstUpperCase = (str) => str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());

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
    login,
};
