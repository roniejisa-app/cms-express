import CHAT from "./chat.js";
import MEDIA from "./media.js";
window.addEventListener('DOMContentLoaded', function () {
    MEDIA.init();
    MEDIA.event();
    CHAT.init();
})