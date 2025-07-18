import { expect, test } from 'vitest'
import fs from 'fs';

/**
 * Ensure `window.localStorage`, is only accessed via the specific Engine
 */
test('Ensure window.localStorage is not accessed outside of its scope `storage.ts` or this test', () => {
  const stringThatShouldNotExist = 'localStorage';
  const whiteListedFilesWindows = ['src\\lib\\storage.ts', 'src\\blacklistedValues.unit.ts'];
  const whiteListedFiles = [
    ...whiteListedFilesWindows,
    ...(whiteListedFilesWindows.map(e => e.replaceAll('\\','/')))
  ];

  const fileList = getFileList();

  const filesWithBlackListedWord = readFileContents(fileList, stringThatShouldNotExist);

  const finalList = filesWithBlackListedWord.filter(file => {
    return (whiteListedFiles.indexOf(file) === -1)
  });

  expect(finalList).toStrictEqual([]);
})

/**
 * Ensure `allAffixes`, is only accessed via the the affixes test and its instantiation
 */
test('Ensure `allAffixes`, is only accessed via the the affixes test and its instantiation', () => {
  const stringThatShouldNotExist = 'allAffixes.';
  const whiteListedFilesWindows = ['src\\data\\affixes.ts', 'src\\data\\affixes.unit.ts', 'src\\blacklistedValues.unit.ts'];
  const whiteListedFiles = [
    ...whiteListedFilesWindows,
    ...(whiteListedFilesWindows.map(e => e.replaceAll('\\','/')))
  ];

  const fileList = getFileList();

  const filesWithBlackListedWord = readFileContents(fileList, stringThatShouldNotExist);

  const finalList = filesWithBlackListedWord.filter(file => {
    return (whiteListedFiles.indexOf(file) === -1)
  });

  expect(finalList).toStrictEqual([]);
})

/**
 * Ensure `debugger`, is never included in deployed coded
 */
test('Ensure `debugger`, is never included in deployed coded', () => {
  const stringThatShouldNotExist = 'debugger';
  const whiteListedFilesWindows: string[] = ['src\\blacklistedValues.unit.ts'];
  const whiteListedFiles = [
    ...whiteListedFilesWindows,
    ...(whiteListedFilesWindows.map(e => e.replaceAll('\\','/')))
  ];

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
  const ingnorableFiles = ['node_modules', '.yarn', '.git', 'dist'];
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