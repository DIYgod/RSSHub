module.exports = function (router) {
	router.get('/tg-nCoV2019/:district?', require('./tg-nCoV2019'));
};
