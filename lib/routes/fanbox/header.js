import {createCommons} from 'simport';

const {
    require
} = createCommons(import.meta.url);

const config = require('~/config').value;

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
