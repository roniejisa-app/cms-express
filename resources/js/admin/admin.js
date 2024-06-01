import CHAT from './chat'
import MEDIA from './media'
import TABLE from './view/table'
import CRUD from './crud'
import SETTING from './layouts/setting'
window.addEventListener('DOMContentLoaded', function () {
    MEDIA.init()
    MEDIA.event()
    CHAT.init()
    TABLE.init()
    SETTING.init()
    CRUD.init()
})
