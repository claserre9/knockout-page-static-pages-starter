#!/usr/bin/env ts-node
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: create-viewmodel <Name> [--test]');
  process.exit(1);
}

const name = args[0];
const withTest = args.includes('--test');
const className = `${name}ViewModel`;
const componentDir = join('src', 'components');
const filePath = join(componentDir, `${className}.ts`);

if (!existsSync(componentDir)) {
  mkdirSync(componentDir, { recursive: true });
}
if (existsSync(filePath)) {
  console.error(`${filePath} already exists`);
  process.exit(1);
}

const content = `import { BaseViewModel } from '../core/BaseViewModel';

export class ${className} extends BaseViewModel {
  constructor(context: PageJS.Context | undefined) {
    super(context);
    this.setTemplate(\`<h1>${name}</h1>\`);
  }
}
`;

writeFileSync(filePath, content, { flag: 'wx' });
console.log(`Created ${filePath}`);

if (withTest) {
  const testDir = 'tests';
  const testPath = join(testDir, `${className}.test.ts`);
  if (!existsSync(testDir)) {
    mkdirSync(testDir, { recursive: true });
  }
  if (existsSync(testPath)) {
    console.error(`${testPath} already exists`);
    process.exit(1);
  }

  const testContent = `import { describe, it, expect } from 'vitest';
import { ${className} } from '../src/components/${className}';

describe('${className}', () => {
  it('renders default template', () => {
    const vm = new ${className}(undefined);
    const html = vm.renderHtml();
    expect(html).toContain('${name}');
  });
});
`;
  writeFileSync(testPath, testContent, { flag: 'wx' });
  console.log(`Created ${testPath}`);
}
