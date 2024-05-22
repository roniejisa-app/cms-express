import CHAT from "./chat.js";
import MEDIA from "./media.js";
import TABLE from "./view/table.js";
import CRUD from './crud.js';
window.addEventListener('DOMContentLoaded', function () {
    MEDIA.init();
    MEDIA.event();
    CHAT.init();
    TABLE.init();
})