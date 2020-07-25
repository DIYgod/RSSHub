const md5 = require('@/utils/md5');

const decrypt_password = (data) => md5(md5(data) + 'daddy');

const random_nonce = (count) => {
    const arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
    const shuffled = arr.slice(0);
    let i = arr.length,
        temp,
        index,
        str = '';
    const min = i - count;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        str = str + temp;
    }
    return str;
};

const decrypt_xyz = (username, decrypt_password, nonce) => {
    const str = '/nr/user/login/loginByAccount?AppKey=joker&account=' + username + '&password=' + decrypt_password + '&state=1&nonce=' + nonce;
    return md5(str);
};

const decrypt_xyz2 = (wxid, nonce) => {
    const str = '/xdnphb/detail/v1/rank/article/lists?AppKey=joker&account=' + wxid + '&nonce=' + nonce;
    return md5(str);
};

const decrypt_douyin_account_xyz = (nonce) => {
    const str = '/xdnphb/nr/cloud/douyin/detail/accountInfoAll?AppKey=joker&nonce=' + nonce;
    return md5(str);
};

const decrypt_douyin_detail_xyz = (nonce) => {
    const str = '/xdnphb/nr/cloud/douyin/detail/aweme?AppKey=joker&nonce=' + nonce;
    return md5(str);
};

const flatten = (arr) => arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val) : val), []);

module.exports = {
    decrypt_password,
    random_nonce,
    decrypt_xyz,
    decrypt_xyz2,
    decrypt_douyin_account_xyz,
    decrypt_douyin_detail_xyz,
    flatten,
};
