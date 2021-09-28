import core from './core.js';
import { calculateValue } from './router.js';
let envs = process.env;
let value = {
    ...core,
    ...calculateValue(envs)
};

export function set(env) {
    envs = Object.assign(process.env, env);
    value = {
        ...core,
        ...calculateValue(envs)
    };
}

export function get() {
    return value
}