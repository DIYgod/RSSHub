import {createSimport} from 'simport';

// Wrapper to avoid any further changes
export function createImport(url) {
    return createSimport(url);
}