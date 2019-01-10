const logger = require('./logger');
const config = require('../config');
const SocksProxyAgent = require('socks-proxy-agent')
const axiosRetry = require('axios-retry');

let axios = require('axios');
if(config.proxy && config.proxy.slice(0,5) == "socks"){
    // axios closure lead to recursive invokation on create
    let axiosCpy = axios
    // When used directly
    let dump = axios.create({
        httpAgent: new SocksProxyAgent(config.proxy),
        httpsAgent: new SocksProxyAgent(config.proxy)
    })
    dump.create = function(option,...args){
        option = option || {}
        option = {
            httpAgent: new SocksProxyAgent(config.proxy),
            httpsAgent: new SocksProxyAgent(config.proxy),
                ...option
        }
        return axiosCpy.create(option,...args)
        
    }
    axios = dump
}
axiosRetry(axios, {
    retries: config.requestRetry,
    retryCondition: () => true,
    retryDelay: (count, err) => {
        logger.error(`Request ${err.config.url} fail, retry attempt #${count}: ${err}`);
        return 100;
    },
});

axios.defaults.headers.common['User-Agent'] = config.ua;
axios.defaults.headers.common['X-APP'] = 'RSSHub';

module.exports = axios;
