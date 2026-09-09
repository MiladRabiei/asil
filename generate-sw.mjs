import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const buildId = (await readFile(resolve('.next/BUILD_ID'), 'utf8')).trim();

const template = await readFile(resolve('public/sw.template.js'), 'utf8');

await writeFile(resolve('public/sw.js'), template.replaceAll('__NEXT_BUILD_ID__', buildId));
