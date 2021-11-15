import {fileURLToPath} from 'node:url';
import path from 'node:path';

export function __filename (metaUrl) {
  return fileURLToPath(metaUrl);
} 
export function __dirname (metaUrl) {
  return path.dirname(__filename(metaUrl))
}