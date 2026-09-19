import parserWasm from '@oxc-parser/binding-wasm32-wasip1/wasm.wasm';
import { instantiate } from '@oxc-parser/binding-wasm32-wasip1/workerd';
import { type OxcError, type Program } from 'oxc-parser';
import { wrap } from 'oxc-parser/src-js/wrap.js';

let bindingPromise: ReturnType<typeof instantiate> | undefined;
/**
 * @see https://github.com/oxc-project/oxc/pull/25442 still bleeding edge
 * */
export const parseScriptSource = async (source: string): Promise<{ program: Program; errors: OxcError[] }> => {
    bindingPromise ??= instantiate(parserWasm);
    const binding = await bindingPromise;
    const { program, errors } = wrap(
        binding.parseSync('script.js', source, {
            lang: 'js',
            sourceType: 'script',
            preserveParens: false,
        }) as never
    );
    return { program, errors };
};
