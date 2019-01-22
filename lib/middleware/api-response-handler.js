/**
 * HTTP Status codes
 */
const statusCodes = {
    CONTINUE: 100,
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    REQUEST_TIMEOUT: 408,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIME_OUT: 504,
};

function responseHandler() {
    return async (ctx, next) => {
        ctx.res.statusCodes = statusCodes;
        ctx.statusCodes = ctx.res.statusCodes;

        ctx.res.success = ({ statusCode, data = null, message = null }) => {
            const status = 0;

            if (!!statusCode && statusCode < 400) {
                ctx.status = statusCode;
            } else if (!(ctx.status < 400)) {
                ctx.status = statusCodes.OK;
            }

            ctx.body = { status, data, message };
        };

        ctx.res.fail = ({ statusCode, code, data = null, message = null }) => {
            const status = -1;

            if (!!statusCode && (statusCode >= 400 && statusCode < 500)) {
                ctx.status = statusCode;
            } else if (!(ctx.status >= 400 && ctx.status < 500)) {
                ctx.status = statusCodes.BAD_REQUEST;
            }

            ctx.body = { status, code, data, message };
        };

        ctx.res.error = ({ statusCode, code, data = null, message = null }) => {
            const status = -2;

            if (!!statusCode && (statusCode >= 500 && statusCode < 600)) {
                ctx.status = statusCode;
            } else if (!(ctx.status >= 500 && ctx.status < 600)) {
                ctx.status = statusCodes.INTERNAL_SERVER_ERROR;
            }

            ctx.body = { status, code, data, message };
        };

        ctx.res.ok = (params = {}) => {
            ctx.res.success({
                ...params,
                statusCode: statusCodes.OK,
            });
        };

        ctx.res.created = (params = {}) => {
            ctx.res.success({
                ...params,
                statusCode: statusCodes.CREATED,
            });
        };

        ctx.res.accepted = (params = {}) => {
            ctx.res.success({
                ...params,
                statusCode: statusCodes.ACCEPTED,
            });
        };

        ctx.res.noContent = (params = {}) => {
            ctx.res.success({
                ...params,
                statusCode: statusCodes.NO_CONTENT,
            });
        };

        ctx.res.badRequest = (params = {}) => {
            ctx.res.fail({
                ...params,
                statusCode: statusCodes.BAD_REQUEST,
            });
        };

        ctx.res.forbidden = (params = {}) => {
            ctx.res.fail({
                ...params,
                statusCode: statusCodes.FORBIDDEN,
            });
        };

        ctx.res.notFound = (params = {}) => {
            ctx.res.fail({
                ...params,
                statusCode: statusCodes.NOT_FOUND,
            });
        };

        ctx.res.requestTimeout = (params = {}) => {
            ctx.res.fail({
                ...params,
                statusCode: statusCodes.REQUEST_TIMEOUT,
            });
        };

        ctx.res.unprocessableEntity = (params = {}) => {
            ctx.res.fail({
                ...params,
                statusCode: statusCodes.UNPROCESSABLE_ENTITY,
            });
        };

        ctx.res.internalServerError = (params = {}) => {
            ctx.res.error({
                ...params,
                statusCode: statusCodes.INTERNAL_SERVER_ERROR,
            });
        };

        ctx.res.notImplemented = (params = {}) => {
            ctx.res.error({
                ...params,
                statusCode: statusCodes.NOT_IMPLEMENTED,
            });
        };

        ctx.res.badGateway = (params = {}) => {
            ctx.res.error({
                ...params,
                statusCode: statusCodes.BAD_GATEWAY,
            });
        };

        ctx.res.serviceUnavailable = (params = {}) => {
            ctx.res.error({
                ...params,
                statusCode: statusCodes.SERVICE_UNAVAILABLE,
            });
        };

        ctx.res.gatewayTimeOut = (params = {}) => {
            ctx.res.error({
                ...params,
                statusCode: statusCodes.GATEWAY_TIME_OUT,
            });
        };
        await next();
    };
}

module.exports = responseHandler;
