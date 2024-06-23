import 'grapesjs/dist/css/grapes.min.css'
import '../css/grapes.scss'
import GrapesJS from 'grapesjs'
import { panelAdd, panelCommand, panelManager } from './components/panelManager'
import { blockManager } from './components/blockManager'
import { styleManager } from './components/styleManager'
import { deviceCommand, deviceManager } from './components/deviceManager'
import { storeManager } from './components/storageManager'
import { eventManager } from './components/eventManager'
import plugin from '../plugins/grapesjs-tailwind/index'
import countdown from '../plugins/countdown/index'
import { dragMode } from './settings/dragmode'

const ENDPOINT = import.meta.env.VITE_BU+'/endpoint'
const id = document.querySelector('.editor-main').id
const escapeName = (name) =>
    `${name}`.trim().replace(/([^a-z0-9\w-:/]+)/gi, '-')
const editor = GrapesJS.init({
    container: '#gjs',
    fromElement: true,
    showOffsets: true,
    componentFirst:1,
    height: 'calc(100% - 40px)',
    layerManager: {
        appendTo: '.layers-container',
    },
    panels: panelManager(),
    blockManager: blockManager(),
    selectorManager: {
        escapeName,
        appendTo: '.styles-container',
        componentFirst: true,
    },
    styleManager: styleManager(),
    traitManager: {
        appendTo: '.traits-container',
    },
    deviceManager: deviceManager(),
    storageManager: storeManager(ENDPOINT, id),
    canvas: {
        styles: ['/core/plugins/pages/css/custom.css'],
    },
    pluginsOpts: [plugin, countdown],
    plugins: [(editor) => plugin(editor, {}), countdown],
})

// Thêm các sự kiện, thêm command, lắng nghe sự kiện
eventManager(editor)
panelAdd(editor)
panelCommand(editor)
deviceCommand(editor)
dragMode(editor)