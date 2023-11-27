/*
 * @Author: nightmare-mio wanglongwei2009@qq.com
 * @Date: 2023-11-27 23:54:17
 * @LastEditTime: 2023-11-27 23:54:59
 * @Description:
 */
module.exports = function (router) {
    router.get('/:keywords', require('./lightNovel'));
};
