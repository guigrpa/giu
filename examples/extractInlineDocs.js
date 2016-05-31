const fs = require('fs');
const path = require('path');
const diveSync = require('diveSync');
const storyboard = require('storyboard');
const story = storyboard.mainStory;
const chalk = storyboard.chalk;

const SRC_EXTENSIONS = ['.js'];
const SRC_PATHS = ['src'];

function getDocs(srcPath) {
  story.info('extractDocs', `Processing ${chalk.yellow.bold(srcPath)}...`);
  const lines = fs.readFileSync(srcPath, 'utf8').split('\n');
  let fCode = false;
  let fBlockComment = false;
  let out = '';
  for (const line0 of lines) {
    let line = line0.trim();
    if (line === '/* --') {
      fBlockComment = true;
      continue;
    }

    // End of comment block
    if (line === '-- */' ||
        (!fBlockComment && (!line.length || line.indexOf('// --') !== 0))) {
      if (!fCode) out += '\n';
      fCode = true;
      fBlockComment = false;
      continue;
    }
    fCode = false;
    if (fBlockComment) {
      out += `${line0}\n`;
    } else {
      line = line.slice(6);
      out += `${line}\n`;
    }
  }
  out = out.trim();
  return out;
}

const out = {};
const diveOptions = { filter: (filePath, fDir) => {
  if (fDir) return true;
  return (SRC_EXTENSIONS.indexOf(path.extname(filePath)) >= 0);
} };
const diveProcess = (err, filePath) => {
  const finalFilePath = path.normalize(filePath);
  out[finalFilePath] = getDocs(finalFilePath);
};
for (const srcPath of SRC_PATHS) {
  diveSync(srcPath, diveOptions, diveProcess);
}

module.exports = out;