import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const vercelConfig = JSON.parse(readFileSync(resolve(projectRoot, 'vercel.json'), 'utf8'));

describe('Next.js production architecture', () => {
  it('uses Next.js as the Vercel production target', () => {
    expect(vercelConfig.framework).toBe('nextjs');
    expect(vercelConfig.buildCommand).toBe('npm run build:next');
    expect(vercelConfig.outputDirectory).toBeUndefined();
    expect(vercelConfig.rewrites).toBeUndefined();
  });

  it.each([
    'src/app/page.next.jsx',
    'src/app/events/page.next.jsx',
    'src/app/community/page.next.jsx',
    'src/app/community/scan/page.next.jsx',
    'src/app/leadership/page.next.jsx',
    'src/app/members/[memberId]/page.next.jsx',
  ])('keeps the App Router route %s', route => {
    expect(existsSync(resolve(projectRoot, route))).toBe(true);
  });

  it('keeps the member profile route bound to the public profile component', () => {
    const routeSource = readFileSync(
      resolve(projectRoot, 'src/app/members/[memberId]/page.next.jsx'),
      'utf8',
    );

    expect(routeSource).toContain("import MemberProfile from '../../../components/members/MemberProfile';");
    expect(routeSource).toContain('<MemberProfile memberId={memberId} />');
  });
});
