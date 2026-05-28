import { promises as fs } from 'fs';
import path from 'path';

const MARKER_START = '/* auto-imports:start */';
const MARKER_END = '/* auto-imports:end */';

const SECTIONS = [
  { dir: 'components', prefix: 'components' },
  { dir: 'boxs', prefix: 'boxs' },
];

function parseAutoImportsBlock(content) {
  const start = content.indexOf(MARKER_START);
  const end = content.indexOf(MARKER_END);

  if (start === -1 || end === -1) {
    return null;
  }

  const block = content.slice(start + MARKER_START.length, end);
  const items = [];

  for (const line of block.split('\n')) {
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    const useMatch = trimmed.match(/^(\/\/\s*)?@use\s+"([^"]+)"\s*;/);

    if (useMatch) {
      items.push({
        type: 'use',
        target: useMatch[2],
        disabled: Boolean(useMatch[1]),
      });
      continue;
    }

    if (trimmed.startsWith('//')) {
      items.push({ type: 'comment', text: trimmed });
    }
  }

  return items;
}

function parseDisabledTargets(items) {
  const disabled = new Set();

  for (const item of items) {
    if (item.type === 'use' && item.disabled) {
      disabled.add(item.target);
    }
  }

  return disabled;
}

async function collectScss(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.scss') && !entry.name.startsWith('_'))
    .map((entry) => entry.name.replace(/\.scss$/, ''));
}

async function getDiskTargets(scssRoot) {
  const targets = new Map();

  for (const { dir, prefix } of SECTIONS) {
    const dirPath = path.join(scssRoot, dir);
    const files = await collectScss(dirPath);

    for (const name of files) {
      targets.set(`${prefix}/${name}`, true);
    }
  }

  return targets;
}

function appendNewcomersInSection(items, diskTargets, disabledTargets, sectionPrefix) {
  const existingInSection = new Set(
    items
      .filter((item) => item.type === 'use' && item.target.startsWith(`${sectionPrefix}/`))
      .map((item) => item.target)
  );

  const newcomers = [...diskTargets.keys()]
    .filter((target) => target.startsWith(`${sectionPrefix}/`) && !existingInSection.has(target));

  for (const target of newcomers) {
    items.push({ type: 'use', target, disabled: disabledTargets.has(target) });
  }
}

function buildItemsKeepOrder(autoItems, diskTargets) {
  const disabledTargets = parseDisabledTargets(autoItems);

  // 1) Keep existing order, but drop removed files.
  const items = autoItems.filter(
    (item) => item.type !== 'use' || diskTargets.has(item.target)
  );

  // 2) Ensure section comments exist (in fixed order), and append newcomers to section end.
  for (const { prefix } of SECTIONS) {
    const commentText = `// ${prefix}`;
    const commentIdx = items.findIndex((i) => i.type === 'comment' && i.text === commentText);

    if (commentIdx === -1) {
      items.push({ type: 'comment', text: commentText });
    }

    const lastIdx = (() => {
      let idx = -1;
      for (let i = 0; i < items.length; i += 1) {
        const it = items[i];
        if (it.type === 'use' && it.target.startsWith(`${prefix}/`)) {
          idx = i;
        }
      }
      return idx;
    })();

    const insertionIdx = lastIdx !== -1
      ? lastIdx + 1
      : (items.findIndex((i) => i.type === 'comment' && i.text === commentText) + 1);

    const sectionNewcomers = [...diskTargets.keys()].filter(
      (target) =>
        target.startsWith(`${prefix}/`)
        && !items.some((it) => it.type === 'use' && it.target === target)
    );

    if (sectionNewcomers.length > 0) {
      const newcomerItems = sectionNewcomers.map((target) => ({
        type: 'use',
        target,
        disabled: disabledTargets.has(target),
      }));
      items.splice(insertionIdx, 0, ...newcomerItems);
    }
  }

  return items;
}

function renderAutoBlock(items) {
  const lines = [MARKER_START, ''];

  for (const item of items) {
    if (item.type === 'comment') {
      lines.push(item.text);
      continue;
    }

    const line = `@use "${item.target}";`;
    lines.push(item.disabled ? `// ${line}` : line);
  }

  lines.push('', MARKER_END);

  return lines;
}

export async function scssEntries() {
  const scssRoot = path.join(app.path.srcFolder, 'scss');
  const styleFile = path.join(scssRoot, 'style.scss');
  const prev = await fs.readFile(styleFile, 'utf8').catch(() => '');
  const diskTargets = await getDiskTargets(scssRoot);

  const autoItems = parseAutoImportsBlock(prev) ?? [];
  const items = buildItemsKeepOrder(autoItems, diskTargets);
  const importLines = renderAutoBlock(items);

  const manualRaw = prev.includes(MARKER_START)
    ? prev.split(MARKER_START)[0]
    : '';

  const manual = manualRaw
    .split('\n')
    .filter((line) => !line.trim().startsWith('/* auto-imports:mode='))
    .join('\n')
    .trimEnd();

  const header = manual
    ? `${manual}\n\n`
    : [
      '// Импорты ниже генерируются Gulp.',
      '// Закомментируйте ненужные строки: // @use "...";',
      '// Порядок строк не пересортировывается: вы управляете им вручную.',
      '',
    ].join('\n');

  await fs.writeFile(styleFile, `${header}${importLines.join('\n')}\n`);
}
