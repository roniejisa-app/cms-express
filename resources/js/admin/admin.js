import CHAT from './chat'
import MEDIA from './media'
import TABLE from './view/table'
import MENU from './layouts/menu'
import CRUD from './crud'
window.addEventListener('DOMContentLoaded', function () {
    MEDIA.init()
    MEDIA.event()
    CHAT.init()
    TABLE.init()
})
