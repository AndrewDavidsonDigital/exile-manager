import { test, beforeEach, vi, expect } from 'vitest';
import fs from 'fs';

beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
});



/**
 * Ensure no `import` statements exist in cote.ts
 */
test('Ensure that there is no import statement in core.ts', () => {
  const stringThatShouldNotExist = 'import';

  const fileList = getFileList();

  const filesWithBlackListedWord = readFileContents(fileList, stringThatShouldNotExist);


  expect(filesWithBlackListedWord).toStrictEqual([]);
})

function readFileContents(fileList: string[], blackListedString: string){
  const retval:string[] = [];

  fileList.forEach(fileName => {
    const fileData = fs.readFileSync(`./src/lib/${fileName}`,'utf-8');

    const hasBlackListedWord = fileData.includes(blackListedString);

    if(hasBlackListedWord){
      retval.push(fileName)
    }
  })

  return retval;
}

function getFileList(){

  const rootFolderContents = fs.readdirSync('./src/lib', { encoding: 'utf-8', recursive: true });

  const includableFileTypes = ['core.ts'];
  const ignorableFiles = ['node_modules', '.yarn', '.git', 'dist'];

  const fileList = rootFolderContents.filter(el => {
    let shouldKeep = true;

    ignorableFiles.forEach(ignorable => {
      if (el.includes(ignorable)){
        shouldKeep = false;
      }
    })

    let isValidFileType = false;
    if (shouldKeep){
      includableFileTypes.forEach(includable => {
        if (el.includes(includable)){
          isValidFileType = true;
        }
      })
    }

    return shouldKeep && isValidFileType;
  })

  return fileList;
}