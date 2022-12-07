module.exports = (router) => {
  router.get('/www/:type', require('./www'));
  router.get('/jwc/:type', require('./jwc'));
};
