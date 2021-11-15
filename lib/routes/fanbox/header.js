import { config } from '~/config.js';

// unlock contents paid by user
export default () => {
    const sessid = config.fanbox.session;
    let cookie = '';
    if (sessid) {
        cookie += `FANBOXSESSID=${sessid}`;
    }
    const headers = { origin: 'https://fanbox.cc', cookie };

    return headers;
};
