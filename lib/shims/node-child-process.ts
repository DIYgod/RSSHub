// Worker-specific shim for node:child_process
// This module is not available in Cloudflare Workers

export function execSync(_command: string): Buffer {
    // Return empty buffer - git info will fall back to 'unknown'
    return Buffer.from('');
}

export function exec() {
    throw new Error('exec is not supported in Cloudflare Workers');
}

export function spawn() {
    throw new Error('spawn is not supported in Cloudflare Workers');
}
