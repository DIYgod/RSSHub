const config = require('@/config').value;
const allowDomain = ['91porn.com', 'www.91porn.com', '0122.91p30.com', 'www.91zuixindizhi.com', 'w1218.91p46.com'];

const domainValidation = (domain, ctx) => {
    if (!config.feature.allow_user_supply_unsafe_domain && !allowDomain.includes(domain)) {
        ctx.throw(403, `This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }
};

module.exports = {
    domainValidation,
};
