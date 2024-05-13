import CHAT from "./chat.js";
import MEDIA from "./media.js";
import FILTER from "./view/filter.js";
window.addEventListener('DOMContentLoaded', function () {
    MEDIA.init();
    MEDIA.event();
    CHAT.init();
    FILTER.init();
})