import { n as notify, r as request, f as formatBytes, u as urlEndpoint } from "./config.js";
let aside = document.querySelector("aside");
let listFolderAside = aside.querySelector(".folder-list ul");
let mediaMainEl = document.querySelector(".media-main");
let files = mediaMainEl.querySelector(".files");
let listItem = files.querySelector(".list-item");
let folderEl = mediaMainEl.querySelector(".folders");
let listItemFolder = folderEl.querySelector(".list-item");
let mediaInfo = document.querySelector(".media-info");
const template = {
  itemFolder: (data) => {
    return `<a href="${window.location.pathname}/${data.id}" class="item folder" data-file='${JSON.stringify(data)}'>
                    <img src="/images/admin/folder.svg" alt="${data.filename}">
                    <div class="item-info">
                        <h3>${data.filename}</h3>
                    </div>
                </a>`;
  },
  itemFolderAside: (data) => {
    return `<li data-id="${data.id}">
          <a href="${window.location.pathname}/${data.id}">
            <img src="/images/admin/folder.svg" alt="Folder">
            <span>${data.filename}</span>
          </a>
        </li>`;
  },
  itemFile: (data) => {
    let output = `<label class="item file" data-file='${JSON.stringify(data)}'>
                    <input type="checkbox" name="id" value="${data.id}" hidden>`;
    if (["png", "jpeg", "jpg", "webp", "tiff", "svg", "bmp"].includes(data.extension.toLowerCase())) {
      output += `<img src="/${data.path_absolute}" alt="${data.filename}">`;
    } else if (["docx", "pptx", "xlsx", "pdf", "mp4"].includes(data.extension.toLowerCase())) {
      output += `<img src="/images/admin/${extension.toLowerCase()}.svg" alt="${data.filename}">`;
    } else {
      output += `<img src="/images/admin/file.svg" alt="${data.filename}">`;
    }
    output += `<div class="file-body">
                        <h3>${data.filename}</h3>
                        <ul class="action">`;
    if (data.delete_at !== null) {
      output += `<li>
                                    <button class="restore">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                            <path
                                                d="M142.9 142.9c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5c0 0 0 0 0 0H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5c7.7-21.8 20.2-42.3 37.8-59.8zM16 312v7.6 .7V440c0 9.7 5.8 18.5 14.8 22.2s19.3 1.7 26.2-5.2l41.6-41.6c87.6 86.5 228.7 86.2 315.8-1c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.2 62.2-162.7 62.5-225.3 1L185 329c6.9-6.9 8.9-17.2 5.2-26.2s-12.5-14.8-22.2-14.8H48.4h-.7H40c-13.3 0-24 10.7-24 24z" />
                                        </svg>
                                    </button>
                                </li>
                                <li>
                                    <button class="delete-force">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>
                                    </button>
                                </li>`;
    } else {
      output += `<li><button class="edit"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"/></svg></button></li>
                            <li><button class="delete"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg></button></li>`;
    }
    output += `</ul>
                    </div>
                </label>`;
    return output;
  },
  listItemFolderAside: (data, id = null) => {
    let listItem2 = data.map((folder) => {
      return `<li>
                <a href="/admin/medias/${id != null ? id + "/" : ""}${folder.id}">
                    ${folder.medias && folder.medias ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                        <path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z" />
                        </svg>` : ""}
                    <img src="/images/admin/folder.svg" alt="${folder.filename}">
                    <span>${folder.filename}</span>
                </a>
            </li>`;
    });
    return `<ul>${listItem2.join("")}</ul>`;
  },
  editFile: (extension2, path_absolute, filename, note, description, id) => {
    return `
                <h1>Sửa thông tin</h1>
                ${["png", "jpeg", "webp", "tiff", "bmp", "jpg"].includes(extension2) ? `
                <div class="image">
                    <img src="/${path_absolute}" alt="" />
                </div>
                ` : ""}
                <form action="/admin/medias/edit-file/${id}">
                <input type="text" name="changeImage" value="0" hidden/>
                <label>
                    <span>Tiêu đề</span>
                    <input type="text" name="filename" value="${filename}" placeholder="Nhập tiêu đề file"/>
                </label>
                <label>
                    <span>URL</span>
                    <input type="text" name="path_absolute" value="${window.location.origin + "/" + path_absolute}" placeholder="Nhập đường dẫn"/>
                </label>
                <label>
                    <span>Ghi chú</span>
                    <textarea name="note" placeholder="Nhập ghi chú"/>${note ?? ""}</textarea>
                </label>
                <label>
                    <span>Mô tả</span>
                    <textarea name="description" cols="30" placeholder="Nhập mô tả">${description ?? ""}</textarea>
                </label>
            </form>`;
  },
  templateFolder: (dataFolder) => {
    let output = ``;
    output += `<ul>`;
    if (dataFolder.delete_at) {
      output += `<li>
                <button class="restore">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M142.9 142.9c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5c0 0 0 0 0 0H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5c7.7-21.8 20.2-42.3 37.8-59.8zM16 312v7.6 .7V440c0 9.7 5.8 18.5 14.8 22.2s19.3 1.7 26.2-5.2l41.6-41.6c87.6 86.5 228.7 86.2 315.8-1c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.2 62.2-162.7 62.5-225.3 1L185 329c6.9-6.9 8.9-17.2 5.2-26.2s-12.5-14.8-22.2-14.8H48.4h-.7H40c-13.3 0-24 10.7-24 24z"/></svg>
                    Phục hồi
                </button>
            </li>
            <li>
                <button class="delete-force">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <path
                            d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z" />
                    </svg>
                    Xóa
                </button>
            </li>`;
    } else {
      output += `<li>
                <button class="edit">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z"/></svg>
                    Chỉnh sửa
                </button>
            </li>
            <li>
                <button class="delete">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <path
                            d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z" />
                    </svg>
                    Thùng rác
                </button>
            </li>`;
    }
    output += `</ul>`;
    return output;
  }
};
new Event("update-process-event");
const XHR = {
  headers: {
    "Content-Type": "application/json"
  },
  eventUploads: {},
  body: {},
  params: {},
  endpoint: "",
  type: "",
  send: function(method, url, body = {}) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      for (const [eventName, cb] of Object.entries(this.eventUploads)) {
        xhr.upload.addEventListener(eventName, cb);
      }
      this.setBody(body);
      if (this.type === "") {
        this.setHeader("Content-Type", "application/json");
      } else if (this.type === "form") {
        this.setHeader("Content-Type", "application/x-www-form-urlencoded");
      } else if (this.type === "formData") {
        this.setHeader("Content-Type", "multipart/form-data");
      }
      xhr.addEventListener("progress", function(e) {
        let percent = +(e.loaded / e.total * 100).toFixed(2);
        let divProgress = document.body.querySelector(".progress-upload");
        if (!document.body.querySelector(".progress-upload")) {
          divProgress = document.createElement("div");
          divProgress.className = "progress-upload";
          divProgress.innerHTML = `<span></span>
                                        <svg width="100" height="100" viewBox="0 0 100 100" class="circular-progress">
                                            <defs>
                                            <linearGradient id="GradientColor">
                                                <stop offset="0%" stop-color="yellow"></stop>
                                                <stop offset="50%" stop-color="red"></stop>
                                                <stop offset="100%" stop-color="#80afe7"></stop>
                                            </linearGradient>
                                            </defs>
                                            <circle class="bg"></circle>
                                            <circle class="fg"></circle>
                                        </svg>`;
          document.body.append(divProgress);
        }
        const spanPercent = divProgress.querySelector("span");
        const circle = divProgress.querySelector(".circular-progress");
        circle.style.setProperty("--progress", percent);
        spanPercent.innerText = `${percent}%`;
        if (percent === 100) {
          divProgress.animate([{
            opacity: 1
          }, {
            opacity: 0
          }], {
            duration: 1e3,
            easing: "ease-in-out"
          }).finished.then(function() {
            divProgress.remove();
          });
        }
      });
      xhr.responseType = "json";
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
          resolve(xhr.response);
        }
      };
      xhr.addEventListener("process", (e) => {
        dispatchEvent(event);
      });
      let params = this.getParams();
      let urlEndpoint2 = this.endpoint + url + (params ? "?" + params : "");
      let data = this.buildBody();
      xhr.open(method, urlEndpoint2);
      if (Object.keys(this.headers).length) {
        for (let key of Object.keys(this.headers)) {
          if (this.type === "formData" && key === "Content-Type")
            ;
          else {
            xhr.setRequestHeader(key, this.headers[key]);
          }
        }
      }
      xhr.send(data);
    });
  },
  setEventUpload: function(event2, cb) {
    this.eventUploads[event2] = cb;
  },
  setType: function(type) {
    this.type = type;
  },
  buildBody: function() {
    if (this.type === "formData" || this.type === "formExpress") {
      const newFormData = new FormData();
      for (let key of Object.keys(this.body)) {
        if (Array.isArray(this.body[key])) {
          for (const value of this.body[key]) {
            newFormData.append(key, value);
          }
        } else {
          newFormData.append(key, XHR.body[key]);
        }
      }
      return newFormData;
    } else {
      return JSON.stringify(this.body);
    }
  },
  setBody: function(body) {
    this.body = body;
  },
  getParams: function() {
    return Object.entries(this.params).map(([key, value]) => `${key}=${value}`).join("&");
  },
  setParams: function(key, value) {
    this.params[key] = value;
  },
  setHeader: function(key, value) {
    this.headers[key] = value;
  },
  setEndpoint: function(value) {
    this.endpoint = value;
  },
  get: async (url, body = {}) => {
    return XHR.send("get", url, body);
  },
  post: async (url, body = {}) => {
    return XHR.send("post", url, body);
  },
  patch: async (url, body = {}) => {
    return XHR.send("PATCH", url, body);
  }
};
const eventCutCanvasImage = new Event("cut-canvas-image");
let rotate = 0;
let flip = 1;
let elementCurrent = {};
let xCurrent, yCurrent, divEl, clientX, clientY, fixedX, fixedY, fixedItem, widthBox, heightBox, topBox, leftBox;
function addEventEditFile(flipAction, rotateLeftAction, rotateRightAction, restoreAction, id) {
  flipAction.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M0 32v448h448V32H0zm358.4 179.2h-89.6v89.6h-89.6v89.6H89.6V121.6h268.8v89.6z"/></svg><p>Lật ảnh</p>`;
  rotateLeftAction.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M48.5 224H40c-13.3 0-24-10.7-24-24V72c0-9.7 5.8-18.5 14.8-22.2s19.3-1.7 26.2 5.2L98.6 96.6c87.6-86.5 228.7-86.2 315.8 1c87.5 87.5 87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3c-62.2-62.2-162.7-62.5-225.3-1L185 183c6.9 6.9 8.9 17.2 5.2 26.2s-12.5 14.8-22.2 14.8H48.5z"/></svg>
    <p>Xoay Trái</p>`;
  rotateRightAction.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M463.5 224H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1c-87.5 87.5-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5z"/></svg>
    <span>Xoay phải</span>`;
  flipAction.onclick = () => {
    flip = 1;
    rotate = 0;
    if (flip === 1) {
      flip = -1;
    } else {
      flip = 1;
    }
    eventRotateAndFlipImage();
  };
  rotateLeftAction.onclick = () => {
    flip = 1;
    rotate = 0;
    rotate -= 90;
    eventRotateAndFlipImage();
  };
  rotateRightAction.onclick = () => {
    flip = 1;
    rotate = 0;
    rotate += 90;
    if (rotate === 360) {
      rotate = 0;
    }
    eventRotateAndFlipImage();
  };
  if (restoreAction) {
    restoreAction.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M142.9 142.9c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5c0 0 0 0 0 0H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5c7.7-21.8 20.2-42.3 37.8-59.8zM16 312v7.6 .7V440c0 9.7 5.8 18.5 14.8 22.2s19.3 1.7 26.2-5.2l41.6-41.6c87.6 86.5 228.7 86.2 315.8-1c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.2 62.2-162.7 62.5-225.3 1L185 329c6.9-6.9 8.9-17.2 5.2-26.2s-12.5-14.8-22.2-14.8H48.4h-.7H40c-13.3 0-24 10.7-24 24z"/></svg><p>Khôi phục</p>`;
    restoreAction.addEventListener("click", async function() {
      if (confirm("Bạn có muốn khôi phục lại ảnh gốc không?")) {
        try {
          const response = await XHR.patch(`/admin/medias/edit-file/${id}`, {
            changeImage: "original"
          });
          if (response.status === 200) {
            notify.success(response.message);
            let itemChange = Array.from(listItem.children).find(
              (item2) => JSON.parse(item2.dataset.file).id === response.data.id
            );
            itemChange.insertAdjacentHTML("beforebegin", template.itemFile(response.data));
            itemChange.remove();
            dispatchEvent(refreshItemEvent);
            document.querySelector('.edit-file .edit-info button[type="button"]').click();
          } else {
            notify.error(response.message);
          }
        } catch (e) {
          notify.error(e.message);
        }
      }
    });
  }
}
function addEventCropImage(imageContainer, imgEditEl, imgEl, inputChangeImage) {
  elementCurrent = { imageContainer, imgEditEl, imgEl, inputChangeImage };
  imageContainer.style.position = "relative";
  imageContainer.style.fontSize = 0;
  imgEditEl.style.pointerEvents = "none";
  imageContainer.style.userSelect = "none";
  let changeImage = false;
  divEl = document.createElement("div");
  const topLeftEl = document.createElement("div");
  const topRightEl = document.createElement("div");
  const bottomLeftEl = document.createElement("div");
  const bottomRightEl = document.createElement("div");
  styleButtonCrop(topLeftEl, topRightEl, bottomLeftEl, bottomRightEl, divEl, imgEditEl);
  divEl.append(topLeftEl, topRightEl, bottomLeftEl, bottomRightEl);
  imageContainer.append(divEl);
  elementCurrent.divEl = divEl;
  elementCurrent.croppedCanvasContainer = divEl;
  topLeftEl.addEventListener("mousedown", function() {
    changeImage = true;
    fixedItem = divEl.getBoundingClientRect();
    fixedX = fixedItem.left + fixedItem.width;
    fixedY = fixedItem.top + fixedItem.height;
    clientX = imageContainer.getBoundingClientRect().left;
    clientY = imageContainer.getBoundingClientRect().top;
    document.addEventListener("mousemove", moveTopLeft);
  });
  topRightEl.addEventListener("mousedown", function() {
    changeImage = true;
    fixedItem = divEl.getBoundingClientRect();
    fixedY = fixedItem.top + fixedItem.height;
    clientX = imageContainer.getBoundingClientRect().left;
    clientY = imageContainer.getBoundingClientRect().top;
    document.addEventListener("mousemove", moveTopRight);
  });
  bottomLeftEl.addEventListener("mousedown", function(e) {
    changeImage = true;
    fixedItem = divEl.getBoundingClientRect();
    clientX = imageContainer.getBoundingClientRect().left;
    clientY = imageContainer.getBoundingClientRect().top;
    document.addEventListener("mousemove", moveBottomLeft);
  });
  bottomRightEl.addEventListener("mousedown", function(e) {
    changeImage = true;
    fixedItem = divEl.getBoundingClientRect();
    document.addEventListener("mousemove", moveBottomRight);
  });
  document.addEventListener("mouseup", () => {
    document.removeEventListener("mousemove", moveTopLeft);
    document.removeEventListener("mousemove", moveTopRight);
    document.removeEventListener("mousemove", moveBottomLeft);
    document.removeEventListener("mousemove", moveBottomRight);
    document.removeEventListener("mousemove", moveDivEl);
    if (changeImage) {
      updateImageChange();
    }
    changeImage = false;
  });
  divEl.addEventListener("mousedown", (e) => {
    if (e.target === divEl) {
      xCurrent = divEl.style.left;
      yCurrent = divEl.style.top;
      clientX = e.clientX;
      clientY = e.clientY;
      document.addEventListener("mousemove", moveDivEl);
    }
  });
  function moveDivEl(e) {
    const rect = divEl.parentElement.getBoundingClientRect();
    const rectDivCrop = divEl.getBoundingClientRect();
    const maxLeft = rect.width - rectDivCrop.width;
    const maxTop = rect.height - rectDivCrop.height;
    let x, y;
    const nextX = Math.abs(e.clientX - clientX);
    const nextY = Math.abs(e.clientY - clientY);
    x = +xCurrent.replace("px", "");
    y = +yCurrent.replace("px", "");
    x = x + (e.clientX >= clientX ? nextX : -nextX);
    y = y + (e.clientY >= clientY ? nextY : -nextY);
    if (x > maxLeft) {
      x = maxLeft;
    } else if (x < 0) {
      x = 0;
    }
    if (y > maxTop) {
      y = maxTop;
    } else if (y < 0) {
      y = 0;
    }
    divEl.style.left = x + "px";
    divEl.style.top = y + "px";
    leftBox = x;
    topBox = y;
    if (divEl.style.left !== xCurrent || divEl.style.top !== yCurrent) {
      changeImage = true;
    }
  }
  function moveTopLeft(e) {
    const x = e.clientX;
    const y = e.clientY;
    leftBox = x - clientX;
    topBox = y - clientY;
    widthBox = fixedX - x;
    heightBox = fixedY - y;
    updateCropEl();
  }
  function moveTopRight(e) {
    const x = e.clientX;
    const y = e.clientY;
    topBox = y - clientY;
    leftBox = fixedItem.left - clientX;
    widthBox = x - fixedItem.left;
    heightBox = fixedY - y;
    updateCropEl();
  }
  function moveBottomLeft(e) {
    const x = e.clientX;
    const y = e.clientY;
    topBox = divEl.offsetTop;
    leftBox = x - clientX;
    widthBox = fixedItem.width + fixedItem.left - x;
    heightBox = y - fixedItem.top;
    updateCropEl();
  }
  function moveBottomRight(e) {
    const x = e.clientX;
    const y = e.clientY;
    topBox = divEl.offsetTop;
    leftBox = divEl.offsetLeft;
    widthBox = x - fixedItem.left;
    heightBox = y - fixedItem.top;
    updateCropEl();
  }
}
function updateCropEl(rotate2 = false) {
  if (rotate2) {
    const tempBox = topBox;
    topBox = leftBox;
    leftBox = tempBox;
  }
  if (heightBox >= 20 && topBox >= 0) {
    divEl.style.top = topBox + "px";
  }
  if (widthBox >= 20 && leftBox >= 0) {
    divEl.style.left = leftBox + "px";
  }
  const parentRectDivEl = divEl.parentElement.getBoundingClientRect();
  if (topBox + heightBox > parentRectDivEl.height) {
    heightBox = parentRectDivEl.height - topBox;
  }
  if (leftBox + widthBox > parentRectDivEl.width) {
    widthBox = parentRectDivEl.width - leftBox;
  }
  if (widthBox >= 20 && leftBox >= 0) {
    divEl.style.width = widthBox + "px";
  }
  if (heightBox >= 20 && topBox >= 0) {
    divEl.style.height = heightBox + "px";
  }
}
function styleButtonCrop(topLeftEl, topRightEl, bottomLeftEl, bottomRightEl, divEl2, imgEditEl) {
  divEl2.style.position = "absolute";
  divEl2.style.top = 0;
  divEl2.style.zIndex = 3;
  divEl2.style.left = 0;
  divEl2.style.background = "rgba(0,0,0,0.1)";
  divEl2.style.width = `${imgEditEl.offsetWidth}px`;
  divEl2.style.height = `${imgEditEl.offsetHeight}px`;
  divEl2.style.cursor = "move";
  widthBox = imgEditEl.offsetWidth;
  heightBox = imgEditEl.offsetHeight;
  leftBox = 0;
  topBox = 0;
  divEl2.style.border = "1px solid white";
  [topLeftEl, topRightEl, bottomLeftEl, bottomRightEl].forEach((el) => {
    el.style.width = "10px";
    el.style.height = "10px";
    el.style.borderRadius = "50%";
    el.style.position = "absolute";
    el.style.border = "1px solid white";
    el.style.background = "black";
    el.style.zIndex = 3;
  });
  topLeftEl.style.cursor = "nwse-resize";
  topRightEl.style.cursor = "sw-resize";
  bottomLeftEl.style.cursor = "sw-resize";
  bottomRightEl.style.cursor = "nwse-resize";
  topLeftEl.style.transform = `translate(-50%,-50%)`;
  topRightEl.style.transform = `translate(50%,-50%)`;
  topRightEl.style.right = 0;
  topRightEl.style.top = 0;
  bottomLeftEl.style.transform = `translate(-50%, 50%)`;
  bottomLeftEl.style.bottom = 0;
  bottomLeftEl.style.left = 0;
  bottomRightEl.style.transform = `translate(50%, 50%)`;
  bottomRightEl.style.bottom = 0;
  bottomRightEl.style.right = 0;
}
function updateImageChange() {
  if (elementCurrent.croppedCanvasContainer && elementCurrent.imgEl && elementCurrent.imgEditEl) {
    const { croppedCanvasContainer, imgEl, imgEditEl } = elementCurrent;
    eventCutCanvasImage.croppedCanvasContainer = croppedCanvasContainer;
    eventCutCanvasImage.imgEl = imgEl;
    eventCutCanvasImage.imgEditEl = imgEditEl;
    window.dispatchEvent(eventCutCanvasImage);
  }
}
function eventImage() {
  window.addEventListener("cut-canvas-image", function(e) {
    const { croppedCanvasContainer, imgEl, imgEditEl } = e;
    const { inputChangeImage } = elementCurrent;
    const widthCurrent = imgEditEl.offsetWidth;
    const heightCurrent = imgEditEl.offsetHeight;
    const widthMain = imgEditEl.naturalWidth;
    const heightMain = imgEditEl.naturalHeight;
    const rateWidth = widthMain / widthCurrent;
    const rateHeight = heightMain / heightCurrent;
    const canvas2 = document.createElement("canvas");
    let ctx2 = canvas2.getContext("2d");
    const newImage = new Image();
    newImage.src = imgEditEl.src;
    newImage.onload = () => {
      const div = document.createElement("div");
      canvas2.width = croppedCanvasContainer.offsetWidth * rateWidth;
      canvas2.height = croppedCanvasContainer.offsetHeight * rateHeight;
      div.append(newImage);
      div.append(canvas2);
      div.style.position = "relative";
      div.style.width = newImage.naturalWidth + "px";
      div.style.height = newImage.naturalHeight + "px";
      canvas2.style.position = "absolute";
      canvas2.style.left = +croppedCanvasContainer.style.left.replace("px", "") * rateWidth + "px";
      canvas2.style.top = +croppedCanvasContainer.style.top.replace("px", "") * rateHeight + "px";
      let left = +canvas2.style.left.replace("px", "");
      let top = +canvas2.style.top.replace("px", "");
      let x = 0;
      let y = 0;
      ctx2.drawImage(newImage, left, top, canvas2.width, canvas2.height, x, y, canvas2.width, canvas2.height);
      inputChangeImage.value = "new";
      imgEl.src = canvas2.toDataURL();
    };
  });
}
function eventRotateAndFlipImage() {
  const { imgEditEl, imgEl } = elementCurrent;
  const canvas2 = document.createElement("canvas");
  let ctx2 = canvas2.getContext("2d");
  const newImage = new Image();
  newImage.src = imgEditEl.src;
  newImage.onload = () => {
    if (Math.abs(rotate) === 90) {
      canvas2.width = newImage.naturalHeight;
      canvas2.height = newImage.naturalWidth;
    } else {
      canvas2.width = newImage.naturalWidth;
      canvas2.height = newImage.naturalHeight;
    }
    let x = 0;
    if (rotate !== 0) {
      ctx2.rotate(rotate * Math.PI / 180);
      if (rotate === 90) {
        ctx2.translate(0, -canvas2.width);
      } else if (rotate === -90) {
        ctx2.translate(-canvas2.height, 0);
      }
    }
    if (flip === -1) {
      ctx2.scale(flip, 1);
      x = +(canvas2.width * flip);
    }
    ctx2.drawImage(newImage, x, 0);
    imgEditEl.src = canvas2.toDataURL();
    imgEditEl.onload = () => {
      imgEl.src = imgEditEl.src;
      updateCropEl(Math.abs(rotate) === 90);
      updateImageChange();
    };
  };
}
let listAnchorSide = getAnchorAsideFolder();
const eventHasNewFolder = new Event("has-new-folder");
const eventAddAllAction = new Event("add-all-action");
const eventRefreshFolder = new Event("refresh-event-folder");
function getAnchorAsideFolder() {
  return listFolderAside && listFolderAside.querySelectorAll("a");
}
function listFolder() {
  const listFolder2 = folderEl.querySelectorAll(".list-item .item");
  listFolder2.forEach((folder) => {
    folder.addEventListener("contextmenu", function(e) {
      e.preventDefault();
      let menuFolder = document.querySelector(".menu-folder");
      if (menuFolder) {
        menuFolder.remove();
      }
      const pageX2 = e.pageX;
      const pageY2 = e.pageY;
      menuFolder = document.createElement("div");
      menuFolder.className = "menu-folder";
      const dataFolder = JSON.parse(folder.dataset.file);
      menuFolder.dataset.file = folder.dataset.file;
      menuFolder.innerHTML = template.templateFolder(dataFolder);
      document.body.append(menuFolder);
      menuFolder.style.left = pageX2 + "px";
      menuFolder.style.top = pageY2 + "px";
      const listAction = menuFolder.querySelectorAll("ul li button");
      listAction.forEach((buttonEl) => {
        buttonEl.addEventListener("click", async function(e2) {
          const id = dataFolder.id;
          switch (buttonEl.className) {
            case "edit":
              const formAdd2 = document.createElement("form");
              formAdd2.classList.add("form-add-folder");
              const divContainer = document.createElement("div");
              divContainer.classList.add("form-container");
              const input = document.createElement("input");
              input.placeholder = "Nhập tên thư mục...";
              input.value = dataFolder.filename;
              const button = document.createElement("button");
              divContainer.append(input, button);
              formAdd2.append(divContainer);
              button.innerText = "Sửa thư mục";
              formAdd2.onsubmit = async (e3) => {
                button.setAttribute("disabled", true);
                e3.preventDefault();
                request.setEndpoint("");
                const res = await request.post(`/admin/medias/edit/folder/${dataFolder.id}`, {
                  folderName: input.value
                });
                if (res.data.status === 200) {
                  notify.success(res.data.message);
                  dataFolder.filename = res.data.folderName;
                  folder.dataset.file = JSON.stringify(dataFolder);
                  folder.querySelector("h3").innerText = res.data.folderName;
                  listFolderAside.querySelector(`[data-id="${dataFolder.id}"] span`).innerText = res.data.folderName;
                } else {
                  notify.error(res.data.message);
                }
                formAdd2.remove();
              };
              formAdd2.onclick = (e3) => {
                if (e3.target === formAdd2) {
                  formAdd2.remove();
                }
              };
              document.body.append(formAdd2);
              break;
            case "delete":
              if (confirm("Chuyển mục này vào thùng rác!")) {
                request.setEndpoint("");
                const res = await request.post(`/admin/medias/delete/${dataFolder.id}`);
                if (res.data.status === 200) {
                  notify.success(res.data.message);
                  folder.remove();
                  if (menuFolder) {
                    menuFolder.remove();
                  }
                  if (listItemFolder.children.length === 0) {
                    listItemFolder.innerHTML = `<p>Chưa có thư mục nào!</p>`;
                  }
                  const folderSidebar = Array.from(listFolderAside.children).find((folderItem) => {
                    return +folderItem.dataset.id === +dataFolder.id;
                  });
                  if (folderSidebar) {
                    folderSidebar.closest("li").remove();
                  }
                  if (listFolderAside.children.length === 0) {
                    listFolderAside.innerHTML = `<ul><p>Chưa có thư mục nào!</p></ul>`;
                  }
                } else {
                  notify.error(res.data.message);
                }
              }
              break;
            case "restore":
              try {
                const res = await request.post(`/admin/medias/restore-all`, {
                  ids: [id],
                  restore: true
                });
                if (res.data.status === 200) {
                  notify.success(res.data.message);
                  folder.remove();
                  if (menuFolder) {
                    menuFolder.remove();
                  }
                  if (listItemFolder.children.length === 0) {
                    listItemFolder.innerHTML = `<p>Chưa có thư mục nào!</p>`;
                  }
                } else {
                  notify.error(res.data.message);
                }
              } catch (e3) {
                notify.error("Thử lại sau!");
              }
              break;
            case "delete-force":
              if (confirm("Bạn có chắc muốn xóa tệp tin này? Chúng sẽ không còn xuất hiện trên blog của bạn, bao gồm bài viết, trang, và widget. Hành động này không thể phục hồi.")) {
                const response = await XHR.post("/admin/medias/delete-force", {
                  ids: [dataFolder.id]
                });
                if (response.status === 200) {
                  notify.success(response.message);
                  folder.remove();
                  if (menuFolder) {
                    menuFolder.remove();
                  }
                  if (listItemFolder.children.length === 0) {
                    listItem.innerHTML = "<p>Không có tệp tin nào!</p>";
                  }
                } else {
                  notify.error(response.message);
                }
              }
              break;
          }
        });
      });
      menuFolder.addEventListener("mousedown", function(e2) {
        e2.stopPropagation();
      });
    });
  });
  document.addEventListener("mousedown", function(e) {
    let menuFolder = document.querySelector(".menu-folder");
    if (menuFolder) {
      menuFolder.remove();
    }
  });
}
function showFolderChild() {
  if (!listAnchorSide)
    return false;
  for (const anchorSide of listAnchorSide) {
    anchorSide.onclick = showFolderChild2;
  }
  async function showFolderChild2(e) {
    if (e.target.nodeName === "svg" || e.target.nodeName === "path") {
      e.preventDefault();
      if (!this.nextElementSibling) {
        const media_id = this.getAttribute("href").replace("/admin/medias/", "");
        const res = await request.get("/admin/medias/folder/" + media_id);
        this.insertAdjacentHTML("afterend", template.listItemFolderAside(res.data.folders, res.data.id));
        window.dispatchEvent(eventHasNewFolder);
      }
    }
  }
}
function allAction() {
  for (const item2 of listItem.children) {
    const { id, customs, filename, description, note, path_absolute, extension: extension2 } = JSON.parse(item2.dataset.file);
    const dataCustom = JSON.parse(customs);
    const removeItemBtn = item2.querySelector(".delete");
    const editItemBtn = item2.querySelector(".edit");
    const restoreItemBtn = item2.querySelector(".restore");
    const deleteItemBtn = item2.querySelector(".delete-force");
    item2.addEventListener("mouseover", function() {
      this.classList.add("show");
    });
    item2.addEventListener("mouseleave", function() {
      this.classList.remove("show");
    });
    if (removeItemBtn) {
      removeItemBtn.onclick = async () => {
        if (confirm("Chuyển mục này vào thùng rác!")) {
          try {
            request.setEndpoint("");
            const res = await request.post(`/admin/medias/delete/${id}`);
            if (res.data.status === 200) {
              notify.success(res.data.message);
              item2.remove();
            } else {
              notify.error(res.data.message);
            }
            if (listItem.children.length === 0) {
              listItem.innerHTML = "<p>Không có tệp tin nào!</p>";
            }
          } catch (e) {
            notify.error("Thử lại sau!");
          }
        }
      };
    }
    if (editItemBtn) {
      editItemBtn.onclick = () => {
        let editEl = document.querySelector(".edit-file");
        if (document.querySelector(".edit-file")) {
          document.querySelector(".edit-file").remove();
        }
        editEl = document.createElement("div");
        const containerEl = document.createElement("div");
        editEl.className = "edit-file";
        containerEl.className = "edit-container";
        editEl.append(containerEl);
        let imageContainer, imgEl;
        if (["png", "jpeg", "webp", "tiff", "bmp", "jpg"].includes(extension2)) {
          const divImageEdit = document.createElement("div");
          const divImageContainer = document.createElement("div");
          const divImageTool = document.createElement("div");
          const flipAction = document.createElement("button");
          const rotateLeftAction = document.createElement("button");
          const rotateRightAction = document.createElement("button");
          divImageTool.className = "toolbar";
          divImageTool.append(rotateLeftAction, flipAction, rotateRightAction);
          let restoreAction;
          if (dataCustom.pathAbsoluteOriginal) {
            restoreAction = document.createElement("button");
            divImageTool.append(restoreAction);
          }
          addEventEditFile(flipAction, rotateLeftAction, rotateRightAction, restoreAction, id);
          divImageContainer.className = "edit-image-container";
          imageContainer = document.createElement("div");
          imageContainer.className = "image-container";
          imgEl = document.createElement("img");
          imgEl.src = `/${path_absolute}`;
          imageContainer.append(imgEl);
          divImageContainer.append(imageContainer);
          divImageEdit.append(divImageContainer, divImageTool);
          divImageEdit.className = "edit-image";
          containerEl.append(divImageEdit);
        }
        const divInfoEdit = document.createElement("div");
        divInfoEdit.className = "edit-info";
        containerEl.appendChild(divInfoEdit);
        document.body.append(editEl);
        document.body.style.height = "100vh";
        document.body.style.overflow = "hidden";
        divInfoEdit.innerHTML = template.editFile(extension2, path_absolute, filename, note, description, id);
        const formInfoEl = divInfoEdit.querySelector("form");
        const imageInfoEl = divInfoEdit.querySelector(".image img");
        const inputChangeImage = formInfoEl.querySelector('input[name="changeImage"]');
        if (imageInfoEl) {
          imgEl.onload = () => {
            addEventCropImage(imageContainer, imgEl, imageInfoEl, inputChangeImage);
          };
        }
        handleFormSubmit(formInfoEl, divInfoEdit);
        formInfoEl.insertAdjacentHTML("beforeend", `<div class="action">
                        <button class="btn btn-reset" type="button">Đóng</button>
                        <button class="btn btn-submit" type="submit">Lưu</button>
                    </div>`);
        const cancelEl = containerEl.querySelector(".btn-reset");
        cancelEl.addEventListener("click", function(e) {
          document.body.style.removeProperty("height");
          document.body.style.removeProperty("overflow");
          editEl.remove();
        });
      };
    }
    if (restoreItemBtn) {
      restoreItemBtn.onclick = async () => {
        if (confirm("Bạn muốn khôi phục tệp tin này!")) {
          const response = await XHR.post("/admin/medias/restore-all", {
            ids: [id]
          });
          if (response.status === 200) {
            notify.success(response.message);
            item2.remove();
            if (listItem.children.length === 0) {
              listItem.innerHTML = "<p>Không có tệp tin nào!</p>";
            }
          } else {
            notify.error(response.message);
          }
        }
      };
    }
    if (deleteItemBtn) {
      deleteItemBtn.onclick = async () => {
        if (confirm("Bạn có chắc muốn xóa tệp tin này? Chúng sẽ không còn xuất hiện trên blog của bạn, bao gồm bài viết, trang, và widget. Hành động này không thể phục hồi.")) {
          const response = await XHR.post("/admin/medias/delete-force", {
            ids: [id]
          });
          if (response.status === 200) {
            notify.success(response.message);
            item2.remove();
            if (listItem.children.length === 0) {
              listItem.innerHTML = "<p>Không có tệp tin nào!</p>";
            }
          } else {
            notify.error(response.message);
          }
        }
      };
    }
  }
}
function handleFormSubmit(form, divInfoEdit) {
  form.addEventListener("submit", async function(e) {
    e.preventDefault();
    const formData = Object.fromEntries([...new FormData(e.target)]);
    if (formData.changeImage === "new") {
      const imageInfoEl = divInfoEdit.querySelector(".image img");
      formData.base64Image = imageInfoEl.src;
    }
    const media_id = window.location.pathname.replace("/admin/medias", "");
    formData.media_id = media_id;
    try {
      const response = await XHR.patch(form.getAttribute("action"), formData);
      if (response.status === 200) {
        notify.success(response.message);
        let itemChange = Array.from(listItem.children).find(
          (item2) => JSON.parse(item2.dataset.file).id === response.data.id
        );
        itemChange.insertAdjacentHTML("beforebegin", template.itemFile(response.data));
        itemChange.remove();
        dispatchEvent(refreshItemEvent);
        form.querySelector('button[type="button"]').click();
      } else {
        notify.error(response.message);
      }
    } catch (e2) {
      notify.error(e2.message);
    }
  });
}
function item() {
  showFolderChild();
  allAction();
  listFolder();
  window.addEventListener("add-all-action", allAction);
  window.addEventListener("has-new-folder", () => {
    listAnchorSide = getAnchorAsideFolder();
    showFolderChild();
  });
  window.addEventListener("refresh-event-folder", listFolder);
}
let items = listItem.querySelectorAll(".item");
let showInfo = new Event("show-info-file");
let canvas, ctx, pageX, pageY, movePageX, movePageY, positionTransform, divCloneCanvas, itemsSelecting;
let selecting = false;
function handleMouseDown(event2) {
  event2.preventDefault();
  if (!event2.target.closest(".item")) {
    selecting = true;
    itemsSelecting = getItemSelecting();
    canvas = document.createElement("canvas");
    document.body.append(canvas);
    ctx = canvas.getContext("2d");
    const rect = files.getBoundingClientRect();
    pageX = event2.pageX - rect.left - window.pageXOffset;
    pageY = event2.pageY - rect.top - window.pageYOffset;
    files.style.position = "relative";
    canvas.style.position = "absolute";
    canvas.style.zIndex = "9999";
    canvas.width = files.clientWidth;
    canvas.height = files.clientHeight;
    canvas.style.left = 0;
    canvas.style.top = 0;
    files.append(canvas);
    divCloneCanvas = document.createElement("div");
    divCloneCanvas.style.position = "absolute";
    divCloneCanvas.style.zIndex = "1000";
    files.append(divCloneCanvas);
  }
}
function handleMouseMove(event2) {
  if (selecting) {
    let x, y;
    if (event2.target === canvas) {
      x = event2.offsetX - pageX;
      y = event2.offsetY - pageY;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.rect(pageX, pageY, x, y);
      ctx.fillStyle = "#80afe799";
      ctx.fill();
      movePageX = event2.offsetX;
      movePageY = event2.offsetY;
      if (event2.offsetX >= pageX && event2.offsetY >= pageY) {
        positionTransform = {
          x: pageX,
          y: pageY
        };
      } else if (event2.offsetX >= pageX && event2.offsetY <= pageY) {
        positionTransform = {
          x: pageX,
          y: movePageY
        };
      } else if (event2.offsetX <= pageX && event2.offsetX && event2.offsetY >= pageY) {
        positionTransform = {
          x: movePageX,
          y: pageY
        };
      } else {
        positionTransform = {
          x: movePageX,
          y: movePageY
        };
      }
      divCloneCanvas.style.width = Math.abs(x) + "px";
      divCloneCanvas.style.height = Math.abs(y) + "px";
      divCloneCanvas.style.top = positionTransform.y + "px";
      divCloneCanvas.style.left = positionTransform.x + "px";
      Array.from(items).forEach((item2) => {
        if (isCollision(item2, divCloneCanvas) && event2.ctrlKey && itemsSelecting.includes(item2)) {
          item2.firstElementChild.checked = false;
        } else if (isCollision(item2, divCloneCanvas) || event2.ctrlKey && itemsSelecting.includes(item2) || event2.shiftKey && itemsSelecting.includes(item2)) {
          if (!item2.firstElementChild.checked)
            item2.firstElementChild.checked = true;
        } else {
          item2.firstElementChild.checked = false;
        }
      });
    }
  }
}
function handleMouseUp() {
  divCloneCanvas && divCloneCanvas.remove();
  positionTransform = void 0;
  selecting = false;
  canvas && canvas.remove();
}
function isCollision(element1, element2) {
  const rect1 = element1.getBoundingClientRect();
  const rect2 = element2.getBoundingClientRect();
  if (rect1.left < rect2.left + rect2.width && rect1.left + rect1.width > rect2.left && rect1.top < rect2.top + rect2.height && rect1.top + rect1.height > rect2.top) {
    return true;
  }
  return false;
}
function addEventForItems() {
  for (const item2 of items) {
    item2.onclick = function(event2) {
      event2.preventDefault();
      const _this = this;
      let startItemChecked = getItemSelecting("start");
      let lastItemChecked = getItemSelecting("last");
      let listItemSelecting = getItemSelecting();
      if (!event2.ctrlKey && !event2.shiftKey) {
        if (listItemSelecting.length) {
          listItemSelecting.forEach((item3) => {
            if (item3 !== this) {
              item3.firstElementChild.checked = false;
            }
          });
        }
        this.firstElementChild.checked = true;
      } else if (event2.ctrlKey) {
        if (this.firstElementChild.checked) {
          this.firstElementChild.checked = false;
        } else {
          this.firstElementChild.checked = true;
        }
      } else if (event2.shiftKey) {
        if (listItemSelecting.length) {
          let isIndexNotSeamless = null;
          for (let i = startItemChecked.index; i <= lastItemChecked.index; i++) {
            if (!listItemSelecting[i]) {
              isIndexNotSeamless = i - 1;
              break;
            }
          }
          if (_this.index >= lastItemChecked.index && !isIndexNotSeamless) {
            let indexStart = lastItemChecked.index + 1;
            while (indexStart <= _this.index) {
              items[indexStart].firstElementChild.checked = true;
              indexStart++;
            }
          } else if (_this.index >= lastItemChecked.index && isIndexNotSeamless) {
            let indexStart = isIndexNotSeamless + 1;
            while (indexStart <= _this.index) {
              items[indexStart].firstElementChild.checked = true;
              indexStart++;
            }
          } else if (_this.index <= lastItemChecked.index && _this.index >= startItemChecked.index && !isIndexNotSeamless) {
            for (let i = startItemChecked.index; i <= lastItemChecked.index; i++) {
              listItemSelecting[i].firstElementChild.checked = i <= _this.index;
            }
          } else if (_this.index <= lastItemChecked.index && _this.index >= startItemChecked.index && isIndexNotSeamless) {
            for (let i = startItemChecked.index; i <= lastItemChecked.index; i++) {
              if (listItemSelecting[i]) {
                listItemSelecting[i].firstElementChild.checked = i <= _this.index;
              }
            }
          } else if (_this.index < startItemChecked.index) {
            let indexStart = _this.index;
            while (indexStart <= startItemChecked.index) {
              items[indexStart].firstElementChild.checked = true;
              indexStart++;
            }
          }
        } else {
          Array.from(items).filter((item3, index) => index <= _this.index).forEach(
            (item3) => item3.firstElementChild.checked = true
          );
        }
      }
      window.dispatchEvent(showInfo);
    };
  }
}
function getItemSelecting(position = void 0) {
  const listItemSelecting = [];
  let firstIndex = null;
  let lastIndex = null;
  let index = 0;
  for (const item2 of items) {
    if (item2.firstElementChild.checked) {
      if (firstIndex === null) {
        firstIndex = index;
      }
      lastIndex = index;
      listItemSelecting[index] = item2;
    }
    index++;
  }
  let objectItem;
  switch (position) {
    case "start":
      objectItem = {
        index: firstIndex,
        item: listItemSelecting[firstIndex]
      };
      return objectItem;
    case "last":
      objectItem = {
        index: lastIndex,
        item: listItemSelecting[lastIndex]
      };
      return objectItem;
    default:
      return listItemSelecting;
  }
}
function refreshItem() {
  if (canvas) {
    canvas.width = files.clientWidth;
    canvas.height = files.clientHeight;
  }
  items = listItem.querySelectorAll(".item");
  addEventForItems();
  allAction();
}
function startSelecting() {
  files.addEventListener("mousedown", handleMouseDown);
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
  files.addEventListener("touchstart", handleMouseDown);
  document.addEventListener("touchmove", handleMouseMove);
  document.addEventListener("touchend", handleMouseUp);
  document.addEventListener("mousedown", function(event2) {
    if (!event2.target.closest(".item") && !event2.ctrlKey && !event2.shiftKey) {
      getItemSelecting().forEach(
        (item2) => item2.firstElementChild.checked = false
      );
    }
  });
  window.addEventListener("refresh-event", refreshItem);
  window.addEventListener("show-info-file", function() {
    let objectItem = getItemSelecting("last");
    if (objectItem.index === null || objectItem.index === void 0) {
      mediaInfo.innerHTML = '<p class="text-center">Chọn tệp để xem thông tin</p>';
      return false;
    }
    let dataFile = JSON.parse(objectItem.item.dataset.file);
    let custom = dataFile.customs ? JSON.parse(dataFile.customs) : [];
    if (Object.keys(custom).length === 0) {
      mediaInfo.innerHTML = '<p class="text-center">Chọn tệp để xem thông tin</p>';
      return false;
    }
    let objectDataInfo = {};
    const imgEl = document.createElement("img");
    const tableEl = document.createElement("table");
    const tbodyEl = document.createElement("tbody");
    let trTable = document.createElement("tr");
    mediaInfo.innerHTML = "";
    mediaInfo.innerHTML = `<h1>Thông tin</h1>
                            <div class="image"></div>
                            <div class="info-body"></div>`;
    const imageEl = mediaInfo.querySelector(".image");
    const infoBody = mediaInfo.querySelector(".info-body");
    tableEl.append(tbodyEl);
    infoBody.append(tableEl);
    tbodyEl.append(trTable);
    let hasNature = false;
    if (custom.extension && custom.pathAbsolute) {
      if (["png", "gif", "jpg", "webp", "jpeg", "svg"].includes(
        custom.extension
      )) {
        imgEl.src = `/${custom.pathAbsolute}`;
        hasNature = true;
      } else if (["docx", "mp4", "pdf", "xlsx", "pptx"].includes(
        custom.extension
      )) {
        imgEl.src = `/images/admin/${custom.extension}.svg`;
      } else {
        imgEl.src = `/images/admin/file.svg`;
      }
      imgEl.src && imageEl.append(imgEl);
    }
    if (imgEl.src) {
      imgEl.onload = (e) => showInfo2(e, hasNature);
    } else {
      showInfo2();
    }
    function showInfo2(e, isImage = false) {
      objectDataInfo.filename = custom.filename;
      objectDataInfo.extension = custom.extension;
      objectDataInfo.size = formatBytes(custom.size);
      if (isImage) {
        objectDataInfo.natural = `${imgEl.naturalWidth} ✕ ${imgEl.naturalHeight}`;
      }
      objectDataInfo.created_at = custom.created_at;
      for (const [key, value] of Object.entries(objectDataInfo)) {
        if (value) {
          if (trTable.children.length >= 2) {
            let newTrTable = document.createElement("tr");
            tbodyEl.append(newTrTable);
            trTable = newTrTable;
          }
          switch (key) {
            case "filename":
              trTable.insertAdjacentHTML(
                "beforeend",
                `<td>
                            <div class="title">Tên tệp tin</div>
                            <div class="info">${value}</div>
                        </td>`
              );
              break;
            case "extension":
              trTable.insertAdjacentHTML(
                "beforeend",
                `<td>
                            <div class="title">Định dạng</div>
                            <div class="info">${value}</div>
                        </td>`
              );
              break;
            case "size":
              trTable.insertAdjacentHTML(
                "beforeend",
                `<td>
                            <div class="title">Dung lượng</div>
                            <div class="info">${value}</div>
                        </td>`
              );
              break;
            case "natural":
              trTable.insertAdjacentHTML(
                "beforeend",
                `<td>
                            <div class="title">Kích thước</div>
                            <div class="info">${value}</div>
                        </td>`
              );
              break;
            case "created_at":
              const time = new Date(value);
              const day = time.getDate();
              const month = time.getMonth();
              const year = time.getFullYear();
              trTable.insertAdjacentHTML(
                "beforeend",
                `<td>
                            <div class="title">Ngày tải lên</div>
                            <div class="info">${day} tháng ${month} ${year}</div>
                        </td>`
              );
              break;
          }
        }
      }
    }
  });
  addEventForItems();
}
const refreshItemEvent = new Event("refresh-event");
const eventChooseImage = new Event("choose-image");
const buttonAddNewFolder = document.querySelector(".add-folder");
const buttonUploadFile = document.querySelector(".upload-file");
let dataTransfer = new DataTransfer();
const eventAddFolder = new Event("add-folder");
const eventUploadFile = new Event("add-file");
const eventLoadItem = new Event("load-item");
let formAdd, formUploadFile, listEl;
window.addEventListener("add-folder", (e) => {
  formAdd = document.createElement("form");
  formAdd.classList.add("form-add-folder");
  const divContainer = document.createElement("div");
  divContainer.classList.add("form-container");
  const input = document.createElement("input");
  input.placeholder = "Nhập tên thư mục...";
  const button = document.createElement("button");
  divContainer.append(input, button);
  formAdd.append(divContainer);
  const media_id = window.location.pathname.replace("/admin/medias", "");
  button.innerText = "Thêm thư mục";
  formAdd.onsubmit = async (e2) => {
    button.setAttribute("disabled", true);
    e2.preventDefault();
    request.setEndpoint(urlEndpoint + "/admin");
    const res = await request.post("/medias/add/folder", {
      folderName: input.value,
      media_id
    });
    if (res.data.status === "NOT OK") {
      notify.error(res.data.errors[0].folderName);
    } else {
      if (!listItemFolder.querySelector("a")) {
        listItemFolder.innerHTML = "";
      }
      if (!listFolderAside.querySelector("li")) {
        listFolderAside.innerHTML = "";
      }
      let anchor = listFolderAside.querySelector(
        `[href="/admin/medias/${media_id.startsWith("/") ? media_id.slice(1) : media_id}"]`
      );
      if (!anchor) {
        listFolderAside.insertAdjacentHTML(
          "beforeend",
          template.itemFolderAside(res.data.folder)
        );
      } else if (!anchor.nextElementSibling) {
        const svg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        svg.setAttributeNS(null, "viewBox", "0 0 320 512");
        svg.innerHTML = `<path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"></path>`;
        anchor.prepend(svg);
        anchor.insertAdjacentHTML(
          "afterend",
          `<ul>${template.itemFolderAside(res.data.folder)}</ul>`
        );
      } else {
        anchor.nextElementSibling.insertAdjacentHTML(
          "beforeend",
          template.itemFolderAside(res.data.folder)
        );
      }
      window.dispatchEvent(eventHasNewFolder);
      listItemFolder.insertAdjacentHTML(
        "beforeend",
        template.itemFolder(res.data.folder)
      );
      notify.success(res.data.message);
      formAdd.remove();
      window.dispatchEvent(eventRefreshFolder);
    }
  };
  formAdd.onclick = (e2) => {
    if (e2.target === formAdd) {
      formAdd.remove();
    }
  };
  document.body.append(formAdd);
});
window.addEventListener("add-file", (e) => {
  formUploadFile = document.createElement("form");
  formUploadFile.classList.add("form-add-file");
  formUploadFile.onclick = (e2) => {
    if (e2.target === formUploadFile) {
      cleanUpFormUpload();
    }
  };
  const { divContainer, input, button } = handleUploadPlace();
  formUploadFile.append(divContainer);
  formUploadFile.onsubmit = async (e2) => {
    e2.preventDefault();
    button.setAttribute("disabled", true);
    XHR.setEndpoint(urlEndpoint + "/admin");
    const media_id = window.location.pathname.replace("/admin/medias", "");
    XHR.setType("formData");
    const res = await XHR.post("/medias/add/file", {
      files: Array.from(input.files),
      media_id
    });
    if (res.status === 200) {
      if (!listItem.querySelector(".item")) {
        listItem.innerHTML = "";
      }
      eventLoadItem.items = res.successFiles;
      window.dispatchEvent(eventLoadItem);
      notify.success(res.message);
      cleanUpFormUpload();
      window.dispatchEvent(refreshItemEvent);
    } else {
      notify.error(res.message);
      button.removeAttribute("disabled");
    }
  };
  document.body.append(formUploadFile);
});
function handleUploadPlace() {
  let itemDrag = null;
  let uploadPlace = document.createElement("div");
  const divContainer = document.createElement("div");
  const input = document.createElement("input");
  const button = document.createElement("button");
  const listFileEl = document.createElement("div");
  const spanCount = document.createElement("span");
  const countChoose = document.createTextNode(0);
  const quoteTextNode = document.createTextNode("");
  spanCount.style.color = "white";
  spanCount.innerText = "Đã chọn (";
  quoteTextNode.data = ")";
  spanCount.append(countChoose, quoteTextNode);
  listFileEl.className = "items";
  uploadPlace.className = "upload-place";
  divContainer.classList.add("form-container");
  input.type = "file";
  input.setAttribute("hidden", "");
  input.setAttribute("multiple", "");
  button.innerText = "Thêm file";
  button.className = "btn-submit";
  uploadPlace.append(listFileEl);
  divContainer.append(spanCount, button, uploadPlace, input);
  addActionForInput();
  uploadPlace.ondragover = (e) => {
    e.preventDefault();
  };
  function addActionForInput() {
    uploadPlace.onclick = (e) => {
      if (e.target === uploadPlace || e.target === listFileEl)
        input.click();
    };
    input.onchange = (e) => {
      const files2 = e.target.files;
      let dataTransferFiles = dataTransfer.files;
      const dataTransferItems = dataTransfer.items;
      if (dataTransferFiles.length === 0) {
        for (const file of files2) {
          dataTransferItems.add(file);
        }
        renderItems(getDataTransferFiles());
      } else {
        const newFiles = Array.from(files2).filter((file) => {
          if (!Array.from(dataTransferFiles).some(
            (dataTransferFile) => isSame(dataTransferFile, file)
          )) {
            dataTransferItems.add(file);
            return true;
          } else {
            return false;
          }
        });
        if (newFiles.length) {
          renderItems(newFiles);
        }
      }
      getDataTransferFiles();
    };
  }
  function getDataTransferFiles() {
    input.files = dataTransfer.files;
    countChoose.data = dataTransfer.files.length;
    return dataTransfer.files;
  }
  function renderItems(items2) {
    listEl = Array.from(items2).map((file, index) => {
      const filename = file.name;
      const extension2 = filename.slice(filename.lastIndexOf(".") + 1);
      const url = URL.createObjectURL(file);
      const itemEl = document.createElement("div");
      const span = document.createElement("span");
      const img = document.createElement("img");
      const button2 = document.createElement("button");
      span.innerText = filename;
      itemEl.className = "item";
      if (["png", "jpeg", "jpg", "webp", "tiff", "svg", "bmp"].includes(
        extension2.toLowerCase()
      )) {
        img.src = url;
      } else if (["docx", "pptx", "xlsx", "pdf", "mp4"].includes(
        extension2.toLowerCase()
      )) {
        img.src = `/images/admin/${extension2.toLowerCase()}.svg`;
      } else {
        img.src = "/images/admin/file.svg";
      }
      button2.type = "button";
      button2.innerHTML = "&times;";
      itemEl.setAttribute(
        "data-info",
        JSON.stringify({
          name: file.name,
          type: file.type,
          size: file.size
        })
      );
      itemEl.append(img, button2, span);
      return {
        itemEl,
        url,
        button: button2,
        name: file.name,
        type: file.type,
        size: file.size
      };
    });
    listFileEl.append(...listEl.map((el) => el.itemEl));
    listFileEl.ondragover = (e) => {
      e.preventDefault();
    };
    listEl.forEach((item2) => {
      item2.button.onclick = (e) => {
        e.preventDefault();
        const indexRemove = Array.from(dataTransfer.files).findIndex(
          (dataTransferFile) => isSame(dataTransferFile, item2)
        );
        dataTransfer.items.remove(indexRemove);
        item2.itemEl.remove();
        URL.revokeObjectURL(item2.url);
        getDataTransferFiles();
      };
      item2.itemEl.draggable = true;
      item2.itemEl.ondragstart = (e) => {
        itemDrag = item2.itemEl;
      };
      item2.itemEl.ondragover = (e) => {
        e.preventDefault();
        const itemTarget = e.target.closest(".item");
        if (itemTarget) {
          const rate = itemTarget.offsetWidth / 2;
          if (e.offsetX > rate) {
            itemTarget.parentElement.insertBefore(
              itemTarget,
              itemDrag
            );
          } else if (e.offsetX <= rate) {
            itemTarget.parentElement.insertBefore(
              itemDrag,
              itemTarget
            );
          }
        }
      };
      item2.itemEl.ondrop = () => {
        itemDrag = null;
        sortAfterDrag();
      };
    });
  }
  function isSame(fileOne, fileTwo) {
    return fileOne.name === fileTwo.name && fileOne.size === fileTwo.size && fileOne.type === fileTwo.type;
  }
  function sortAfterDrag() {
    const newDataTransfer = new DataTransfer();
    const listChildren = listFileEl.children;
    for (const itemUpload of listChildren) {
      const index = Array.from(dataTransfer.files).findIndex(
        (dataTransferFile) => isSame(
          dataTransferFile,
          JSON.parse(itemUpload.dataset.info)
        )
      );
      if (index !== -1) {
        newDataTransfer.items.add(dataTransfer.files[index]);
      }
    }
    dataTransfer = newDataTransfer;
    getDataTransferFiles();
  }
  return {
    divContainer,
    input,
    button
  };
}
function cleanUpFormUpload() {
  formUploadFile.remove();
  dataTransfer = new DataTransfer();
  for (const { url } of listEl) {
    URL.revokeObjectURL(url);
  }
}
window.addEventListener("load-item", (e) => {
  if (e.items && Array.isArray(e.items)) {
    e.items.forEach((item2) => {
      listItem.insertAdjacentHTML("afterbegin", template.itemFile(item2));
    });
  }
});
function upload() {
  if (buttonAddNewFolder) {
    buttonAddNewFolder.onclick = (e) => {
      window.dispatchEvent(eventAddFolder);
    };
  }
  if (buttonUploadFile) {
    buttonUploadFile.onclick = (e) => {
      window.dispatchEvent(eventUploadFile);
    };
  }
}
function screen() {
  let page = new URLSearchParams(window.location.search).get("page") ?? 1;
  let loadData = false;
  let observer = new IntersectionObserver(intersectionCallback);
  async function intersectionCallback(entries) {
    for (const entry of entries) {
      if (entry.isIntersecting && !loadData) {
        page++;
        loadData = true;
        const { pathname } = window.location;
        request.setParam("page", page);
        request.setParam("isJson", 1);
        observer.disconnect();
        try {
          const res = await request.get(pathname);
          if (res.data && res.data.rows && res.data.rows.length) {
            eventLoadItem.items = res.data.rows;
            window.dispatchEvent(eventLoadItem);
            lastItem = listItem.children[listItem.children.length - 1];
            observer.observe(lastItem);
            loadData = false;
            window.dispatchEvent(refreshItemEvent);
            window.dispatchEvent(eventAddAllAction);
          }
        } catch (e) {
          console.log(e.message);
        }
      }
    }
  }
  let lastItem = listItem.children[listItem.children.length - 1];
  if (lastItem) {
    observer.observe(lastItem);
  }
}
const MAIN = (() => {
  function handleDeleteAll() {
    const deleteAllBtn = document.querySelector(".events .delete");
    deleteAllBtn && deleteAllBtn.addEventListener("click", async (e) => {
      if (confirm("Bạn có muốn xóa các tệp tin đã chọn?")) {
        let listItemSelecting = getItemSelecting();
        let ids = listItemSelecting.map((item2) => JSON.parse(item2.dataset.file).id);
        deleteAllBtn.setAttribute("disabled", true);
        const response = await XHR.post("/admin/medias/delete-all", {
          ids
        });
        if (response.status === 200) {
          notify.success(response.message);
          listItemSelecting.forEach((item2) => item2.remove());
        } else {
          notify.error(response.message);
        }
        deleteAllBtn.removeAttribute("disabled");
      }
    });
    deleteAllBtn && deleteAllBtn.addEventListener("mousedown", (e) => {
      e.stopPropagation();
    });
  }
  function handleRestoreAll() {
    const restoreAllBtn = document.querySelector(".events .restore");
    restoreAllBtn && restoreAllBtn.addEventListener("click", async (e) => {
      if (confirm("Bạn có muốn khôi phục các tệp tin đã chọn?")) {
        let listItemSelecting = getItemSelecting();
        let ids = listItemSelecting.map((item2) => JSON.parse(item2.dataset.file).id);
        restoreAllBtn.setAttribute("disabled", true);
        const response = await XHR.post("/admin/medias/restore-all", {
          ids
        });
        if (response.status === 200) {
          notify.success(response.message);
          listItemSelecting.forEach((item2) => item2.remove());
        } else {
          notify.error(response.message);
        }
        restoreAllBtn.removeAttribute("disabled");
      }
    });
    restoreAllBtn && restoreAllBtn.addEventListener("mousedown", (e) => {
      e.stopPropagation();
    });
  }
  function handleDeleteForce() {
    const deleteForceAll = document.querySelector(".events .delete-force");
    deleteForceAll && deleteForceAll.addEventListener("click", async (e) => {
      if (confirm("Bạn có chắc muốn xóa tệp tin này? Chúng sẽ không còn xuất hiện trên blog của bạn, bao gồm bài viết, trang, và widget. Hành động này không thể phục hồi?")) {
        let listItemSelecting = getItemSelecting();
        let ids = listItemSelecting.map((item2) => JSON.parse(item2.dataset.file).id);
        deleteForceAll.setAttribute("disabled", true);
        const response = await XHR.post("/admin/medias/delete-force", {
          ids
        });
        if (response.status === 200) {
          notify.success(response.message);
          listItemSelecting.forEach((item2) => item2.remove());
        } else {
          notify.error(response.message);
        }
        deleteForceAll.removeAttribute("disabled");
      }
    });
    deleteForceAll && deleteForceAll.addEventListener("mousedown", (e) => {
      e.stopPropagation();
    });
  }
  function chooseFile() {
    const chooseFile2 = document.querySelector(".events .choose-file");
    if (!chooseFile2)
      return;
    chooseFile2.addEventListener("click", function(e) {
      const iframeEl = window.frameElement;
      if (!iframeEl)
        return false;
      const uuid = iframeEl.dataset.uuid;
      const type = iframeEl.dataset.type;
      const objectData = getItemSelecting(type);
      if (!objectData.item) {
        return notify.error("Vui lòng chọn tệp tin");
      }
      eventChooseImage.uuid = uuid;
      eventChooseImage.data = objectData.item.dataset.file;
      eventChooseImage.typeImage = type;
      window.parent.dispatchEvent(eventChooseImage);
    });
    chooseFile2.addEventListener("mousedown", function(e) {
      e.stopPropagation();
    });
  }
  return {
    init: () => {
      handleDeleteAll();
      handleRestoreAll();
      handleDeleteForce();
      chooseFile();
    }
  };
})();
window.addEventListener("DOMContentLoaded", function() {
  MAIN.init();
  startSelecting();
  upload();
  screen();
  item();
  eventImage();
});
