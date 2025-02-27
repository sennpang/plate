const path = require('path');
const fs = require('fs');
const { camelCase } = require('change-case');

const packageJsonPlate = require('../packages/plate/package.json');
const packageJsonExcalidraw = require('../packages/ui/nodes/excalidraw/package.json');
const packageJsonTestUtils = require('../packages/test-utils/package.json');
const packageJsonJuice = require('../packages/serializers/juice/package.json');

const templateVersions = `export const plateVersion = '${packageJsonPlate.version}';
export const testUtilsVersion = '${packageJsonTestUtils.version}';
export const excalidrawVersion = '${packageJsonExcalidraw.version}';
export const juiceVersion = '${packageJsonJuice.version}';
`;

const inputPath = path.resolve(__dirname, '../examples/src');
const sandpackPath = '../docs/docs/sandpack';
const filesPath = `${sandpackPath}/files`;

function* walkSync(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      yield* walkSync(path.join(dir, file.name));
    } else {
      yield path.join(dir, file.name);
    }
  }
}

module.exports = (plop) => {
  /** @type {import("plop").PlopGeneratorConfig["actions"]} */
  const actions = [];

  let prevDir = '';
  let prevDirFiles = [];
  const dirs = [];

  const generateDirFiles = () => {
    let dirName = prevDir.slice(0, -1);
    if (dirName.indexOf('/') > -1) {
      dirName = dirName.substring(dirName.lastIndexOf('/') + 1);
    }

    let fileContent = '';

    prevDirFiles.forEach(
      (file) =>
        (fileContent += `import { ${camelCase(
          `${file.fileName}File`
        )} } from './code-${file.fileName}';
`)
    );

    fileContent += `
export const ${camelCase(`${dirName}Files`)} = {
`;

    prevDirFiles.forEach(
      (file) =>
        (fileContent += `  ...${camelCase(`${file.fileName}File`)},
`)
    );

    fileContent += `};
`;

    actions.push({
      type: 'add',
      template: fileContent,
      path: `${filesPath}/${prevDir}code-${camelCase(`${dirName}Files`)}.ts`,
      force: true,
    });

    dirs.push({
      name: camelCase(`${dirName}Files`),
      path: `${prevDir}code-${camelCase(`${dirName}Files`)}`,
    });
  };

  for (const templatePath of walkSync(inputPath)) {
    const relativeFilePath = templatePath.split('examples/src/')[1];

    const slashIndex = relativeFilePath.lastIndexOf('/');

    const dir = relativeFilePath.substring(0, slashIndex + 1);

    const codeFileName = `code-${relativeFilePath.substring(slashIndex + 1)}`;
    const codeFilePath = `${dir}${codeFileName}`;

    let outputPath = codeFilePath;
    const extension = codeFilePath.substring(codeFilePath.lastIndexOf('.') + 1);
    if (!['ts', 'tsx'].includes(extension)) {
      outputPath = `${codeFilePath.substring(
        0,
        codeFilePath.lastIndexOf('.') + 1
      )}ts`;
    }

    const fileName = relativeFilePath.substring(
      slashIndex + 1,
      relativeFilePath.lastIndexOf('.')
    );

    /**
     * Each directory exports its files
     */

    if (dir && dir !== prevDir) {
      generateDirFiles();

      prevDirFiles = [];
    }

    /**
     * All files
     */

    actions.push(
      ...[
        {
          type: 'add',
          template: `export const ${camelCase(`${fileName}Code`)} = \`{1}`,
          path: `${filesPath}/${outputPath}`,
          force: true,
        },
        {
          type: 'modify',
          pattern: '{1}',
          transform: (content) => {
            content = `${content.replaceAll('`', '\\`')}\`;`;
            content = content.replace('\\', '');
            content += `

export const ${camelCase(`${fileName}File`)} = {
  '/${relativeFilePath}': ${camelCase(`${fileName}Code`)},
};
`;
            return content;
          },
          path: `${filesPath}/${outputPath}`,
          templateFile: templatePath,
        },
      ]
    );

    if (dir) {
      prevDir = dir;
      prevDirFiles.push({
        fileName,
      });
    }
  }

  // last dir files
  generateDirFiles();

  /**
   * Root files exports all directory files
   */

  let rootFiles = '';

  dirs.forEach(
    (file) =>
      (rootFiles += `import { ${file.name} } from './${file.path}';
`)
  );

  rootFiles += `
export const rootFiles = {
`;

  dirs.forEach(
    (file) =>
      (rootFiles += `  ...${file.name},
`)
  );

  rootFiles += `};
`;

  actions.push({
    type: 'add',
    template: rootFiles,
    path: `${filesPath}/code-files.ts`,
    force: true,
  });

  plop.setActionType('exit', () => {
    process.exit(0);
  });

  actions.push({
    type: 'exit',
  });

  // create your generators here
  plop.setGenerator('sandpack', {
    description: 'generate sandpack files',
    prompts: [],
    actions,
  });

  plop.setGenerator('version', {
    description: 'Update Sandpack dependencies',
    prompts: [],
    actions: [
      {
        type: 'add',
        template: templateVersions,
        path: `${sandpackPath}/plate-versions.ts`,
        force: true,
      },
    ],
  });
};
