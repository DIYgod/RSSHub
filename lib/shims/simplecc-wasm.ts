import { initSync } from '../../node_modules/simplecc-wasm/pkg/web/simplecc_wasm.js';
import wasm from '../../node_modules/simplecc-wasm/pkg/web/simplecc_wasm_bg.wasm';

initSync({ module: wasm });

export { simplecc } from '../../node_modules/simplecc-wasm/pkg/web/simplecc_wasm.js';
