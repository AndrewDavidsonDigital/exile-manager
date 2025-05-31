import { expect, test } from 'vitest'
import fs from 'fs';

/**
 * Ensure `window.localStorage`, is only accessed via the specific Engine
 */
test('Ensure window.localStorage is not accessed outside of its scope `storage.ts` or this test', () => {
  const stringThatShouldNotExist = 'localStorage';
  const whiteListedFiles = ['src\\lib\\storage.ts', 'src\\lib\\storage.unit.ts'];

  const fileList = getFileList();

  const filesWithBlackListedWord = readFileContents(fileList, stringThatShouldNotExist);

  const finalList = filesWithBlackListedWord.filter(file => {
    return (whiteListedFiles.indexOf(file) === -1)
  });

  expect(finalList).toStrictEqual([]);
})

function readFileContents(fileList: string[], blackListedString: string){
  const retval:string[] = [];

  fileList.forEach(fileName => {
    const fileData = fs.readFileSync(fileName,'utf-8');

    const hasBlackListedWord = fileData.includes(blackListedString);

    if(hasBlackListedWord){
      retval.push(fileName)
    }
  })

  return retval;
}


function getFileList(){

  const rootFolderContents = fs.readdirSync('./', { encoding: 'utf-8', recursive: true });

  const includableFileTypes = ['.ts', '.vue', '.js'];
  const ingnorableFiles = ['node_modules', '.yarn', '.git'];
  const fileList = rootFolderContents.filter(el => {
    let shouldKeep = true;

    ingnorableFiles.forEach(ignorable => {
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