import { type OxcError, parseSync, type Program, rawTransferSupported } from 'oxc-parser';

export const parseScriptSource = (source: string): { program: Program; errors: OxcError[] } => {
    const { program, errors } = parseSync('script.js', source, {
        lang: 'js',
        sourceType: 'script',
        preserveParens: false,
        experimentalRawTransfer: rawTransferSupported(),
    } as never);
    return { program, errors };
};
