let aside = document.querySelector('aside');
let listFolderAside = aside.querySelector('.folder-list ul');
let mediaMainEl = document.querySelector('.media-main');
let files = mediaMainEl.querySelector('.files');
let listItem = files.querySelector('.list-item');
let folderEl = mediaMainEl.querySelector('.folders');
let listItemFolder = folderEl.querySelector('.list-item');
let mediaInfo = document.querySelector('.media-info');


export { files, mediaMainEl, listItem, folderEl, listItemFolder, listFolderAside, mediaInfo }