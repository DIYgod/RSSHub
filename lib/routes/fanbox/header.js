const config = require('@/config').value;

// unlock contents paid by user
module.exports = () => {
    const sessid = config.fanbox.session;
    let cookie = '';
    if (sessid) {
        cookie += `FANBOXSESSID=${sessid}`;
    }
    const headers = { origin: 'https://fanbox.cc', cookie: cookie };

    return headers;
};
