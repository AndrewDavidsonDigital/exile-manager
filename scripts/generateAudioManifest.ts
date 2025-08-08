import fs from 'fs';

const AUDIO_ROOT_PATH = './public/';
const AUDIO_MANIFEST_PATH = './src/assets/audio/audioManifest.json';

function getFileList(folderPath: string = './'){

  const rootFolderContents = fs.readdirSync(folderPath, { encoding: 'utf-8', recursive: true });

  const includableFileTypes = ['.m4a'];
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
  }).map(el => el.replaceAll('\\','/'));

  return fileList;
}

function writeAudioManifest(list: string[], folderPath: string){
  fs.writeFileSync(
    folderPath, 
    JSON.stringify({ 
      created: (new Date(Date.now())).toUTCString(),
      manifest: list,
    },
  ));
}

function main(){
  const audioList = getFileList(AUDIO_ROOT_PATH);
  writeAudioManifest(audioList, AUDIO_MANIFEST_PATH);
}


main();