import { importCode } from '../commands/openImportCode'
import { toggleImageCommand } from '../commands/toggleImageCommand'

export const panelManager = () => {
    return {
        defaults: [
            {
                id: 'layers',
                el: '.panel__right',
                // Make the panel resizable
                resizable: {
                    maxDim: 350,
                    minDim: 200,
                    tc: 0, // Top handler
                    cl: 1, // Left handler
                    cr: 0, // Right handler
                    bc: 0, // Bottom handler
                    // Being a flex child we need to change `flex-basis` property
                    // instead of the `width` (default)
                    keyWidth: 'flex-basis',
                },
            },
            {
                id: 'panel-switcher',
                el: '.panel__switcher',
                buttons: [
                    {
                        id: 'show-blocks',
                        active: true,
                        label: `<svg style="display: block; max-width: 22px" viewBox="0 0 24 24">
          <path fill="currentColor" d="M17,13H13V17H11V13H7V11H11V7H13V11H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z"></path>
      </svg>`,
                        command: 'show-blocks',
                        togglable: false,
                    },
                    {
                        id: 'show-layers',
                        active: true,
                        label: `<svg style="display: block; max-width: 22px" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12,16L19.36,10.27L21,9L12,2L3,9L4.63,10.27M12,18.54L4.62,12.81L3,14.07L12,21.07L21,14.07L19.37,12.8L12,18.54Z"></path>
      </svg>`,
                        command: 'show-layers',
                        // Once activated disable the possibility to turn it off
                        togglable: false,
                    },
                    {
                        id: 'show-style',
                        active: true,
                        label: `<svg style="display: block; max-width: 22px" viewBox="0 0 24 24">
            <path fill="currentColor" d="M20.71,4.63L19.37,3.29C19,2.9 18.35,2.9 17.96,3.29L9,12.25L11.75,15L20.71,6.04C21.1,5.65 21.1,5 20.71,4.63M7,14A3,3 0 0,0 4,17C4,18.31 2.84,19 2,19C2.92,20.22 4.5,21 6,21A4,4 0 0,0 10,17A3,3 0 0,0 7,14Z"></path>
        </svg>`,
                        command: 'show-styles',
                        togglable: false,
                    },
                    {
                        id: 'show-traits',
                        active: true,
                        label: `<svg style="display: block; max-width: 22px" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"></path>
      </svg>`,
                        command: 'show-traits',
                        togglable: false,
                    },
                ],
            },
            {
                id: 'panel-devices',
                el: '.panel__devices',
                buttons: [
                    {
                        id: 'device-desktop',
                        label: `<svg style="display: block; max-width: 22px" viewBox="0 0 24 24">
            <path fill="currentColor" d="M21,16H3V4H21M21,2H3C1.89,2 1,2.89 1,4V16A2,2 0 0,0 3,18H10V20H8V22H16V20H14V18H21A2,2 0 0,0 23,16V4C23,2.89 22.1,2 21,2Z"></path>
        </svg>`,
                        command: 'set-device-desktop',
                        active: true,
                        togglable: false,
                    },
                    {
                        id: 'device-tablet',
                        label: `<svg style="display: block; max-width: 22px" viewBox="0 0 24 24">
            <path fill="currentColor" d="M19,18H5V6H19M21,4H3C1.89,4 1,4.89 1,6V18A2,2 0 0,0 3,20H21A2,2 0 0,0 23,18V6C23,4.89 22.1,4 21,4Z"></path>
        </svg>`,
                        command: 'set-device-tablet',
                        togglable: false,
                    },
                    {
                        id: 'device-mobile',
                        label: `<svg style="display: block; max-width: 22px" viewBox="0 0 24 24">
            <path fill="currentColor" d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z"></path>
        </svg>`,
                        command: 'set-device-mobile',
                        togglable: false,
                    },
                ],
            },
        ],
    }
}
export const panelAdd = (editor) => {
    editor.Panels.addPanel({
        id: 'panel-top',
        el: '.panel__top',
    })

    editor.Panels.addPanel({
        id: 'basic-actions',
        el: '.panel__basic-actions',
        buttons: [
            {
                id: 'visibility',
                active: true, // active by default
                className: 'btn-toggle-borders',
                label: `<svg style="display: block; max-width: 22px" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M15,5H17V3H15M15,21H17V19H15M11,5H13V3H11M19,5H21V3H19M19,9H21V7H19M19,21H21V19H19M19,13H21V11H19M19,17H21V15H19M3,5H5V3H3M3,9H5V7H3M3,13H5V11H3M3,17H5V15H3M3,21H5V19H3M11,21H13V19H11M7,21H9V19H7M7,5H9V3H7V5Z"></path>
                        </svg>`,
                command: 'sw-visibility', // Built-in command
            },
            {
                id: 'update-theme',
                label:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M448 256c0-106-86-192-192-192V448c106 0 192-86 192-192zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"/></svg>`,
                command: 'open-update-theme',
                attributes: {
                    style: "max-height:20px",
                    title: 'Update Theme',
                    'data-tooltip-pos': 'bottom',
                },
            },
            {
                id: 'preview',
                active: true, // active by default
                className: 'btn-preview',
                label: `<svg style="display: block; max-width: 22px" viewBox="0 0 24 24"><path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"></path></svg>`,
                command: 'preview', // Built-in command
            },
            {
                id: 'export',
                className: 'btn-open-export',
                label: `<svg style="display: block; max-width: 22px" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12.89,3L14.85,3.4L11.11,21L9.15,20.6L12.89,3M19.59,12L16,8.41V5.58L22.42,12L16,18.41V15.58L19.59,12M1.58,12L8,5.58V8.41L4.41,12L8,15.58V18.41L1.58,12Z"></path>
                        </svg>`,
                command: 'export-template',
                context: 'export-template', // For grouping context of buttons from the same panel
            },
            // Lấy dữ liệu
            //     {
            //         id: 'show-json',
            //         className: 'btn-show-json',
            //         label: 'JSON',
            //         context: 'show-json',
            //         command(editor) {
            //             editor.Modal.setTitle('Components JSON')
            //                 .setContent(
            //                     `<textarea style="width:100%; height: 250px;">
            //     ${JSON.stringify(editor.getComponents())}
            //   </textarea>`
            //                 )
            //                 .open()
            //         },
            //     },
            {
                id: 'show-import-code',
                className: 'btn-show-import-code',
                label: `<svg style="display: block; max-width: 22px" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"></path>
                        </svg>`,
                context: 'show-import-code',
                command: 'gjs-open-import-template',
            },
            {
                id: 'show-image-code',
                className: 'btn-show-image-code',
                label: `<svg style="display: block; max-width: 22px" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M5 3C3.9 3 3 3.9 3 5V19C3 20.11 3.9 21 5 21H14.09C14.03 20.67 14 20.34 14 20C14 19.32 14.12 18.64 14.35 18H5L8.5 13.5L11 16.5L14.5 12L16.73 14.97C17.7 14.34 18.84 14 20 14C20.34 14 20.67 14.03 21 14.09V5C21 3.89 20.1 3 19 3H5M16.47 17.88L18.59 20L16.47 22.12L17.88 23.54L20 21.41L22.12 23.54L23.54 22.12L21.41 20L23.54 17.88L22.12 16.46L20 18.59L17.88 16.47L16.46 17.88Z"></path>
                        </svg>`,
                context: 'show-image-code',
                command: 'gjs-toggle-images',
            },
            {
                id: 'undo',
                className: 'btn-undo-page',
                label: `<svg style="display: block; max-width: 22px" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M20 13.5C20 17.09 17.09 20 13.5 20H6V18H13.5C16 18 18 16 18 13.5S16 9 13.5 9H7.83L10.91 12.09L9.5 13.5L4 8L9.5 2.5L10.92 3.91L7.83 7H13.5C17.09 7 20 9.91 20 13.5Z"></path>
                        </svg>`,
                context: 'undo-data',
                command: () => editor.runCommand('core:undo'),
            },
            {
                id: 'redo',
                className: 'btn-redo-page',
                label: `<svg style="display: block; max-width: 22px" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M10.5 18H18V20H10.5C6.91 20 4 17.09 4 13.5S6.91 7 10.5 7H16.17L13.08 3.91L14.5 2.5L20 8L14.5 13.5L13.09 12.09L16.17 9H10.5C8 9 6 11 6 13.5S8 18 10.5 18Z"></path>
                    </svg>`,
                context: 'redo-data',
                command: () => editor.runCommand('core:redo'),
            },
            {
                //Clear btn
                id: 'remove-all',
                className: 'btn-remove-all-page',
                label: `<svg style="display: block; max-width: 22px" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"></path>
                        </svg>`,
                context: 'remove-all-data',
                command(editor) {
                    if (
                        confirm('Bạn chắc chắn muốn xóa trang này phải không?')
                    ) {
                        editor.DomComponents.clear()
                        editor.CssComposer.clear()
                    }
                },
            },
            {
                //Clear btn
                id: 'save-all',
                className: 'btn-save-all-page',
                label: `<svg xmlns="http://www.w3.org/2000/svg" style="display: block; max-height: 22px" viewBox="0 0 512 512"><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg>`,
                context: 'save-all-data',
                command(editor) {
                    editor.store()
                },
            }
        ],
    })
}
export const panelCommand = (editor) => {
    importCode(editor)
    toggleImageCommand(editor)
    editor.Commands.add('show-layers', {
        getRowEl() {
            return document.querySelector('.editor-right')
        },
        getLayersEl(row) {
            return row.querySelector('.layers-container')
        },

        run(editor) {
            const lmEl = this.getLayersEl(this.getRowEl(editor))
            lmEl.style.display = ''
        },
        stop(editor) {
            const lmEl = this.getLayersEl(this.getRowEl(editor))
            lmEl.style.display = 'none'
        },
    })

    editor.Commands.add('show-blocks', {
        getRowEl() {
            return document.querySelector('.editor-right')
        },
        getLayersEl(row) {
            return row.querySelector('.blocks-container')
        },

        run(editor) {
            const lmEl = this.getLayersEl(this.getRowEl(editor))
            lmEl.style.display = ''
        },
        stop(editor) {
            const lmEl = this.getLayersEl(this.getRowEl(editor))
            lmEl.style.display = 'none'
        },
    })

    editor.Commands.add('show-styles', {
        getRowEl() {
            return document.querySelector('.editor-right')
        },
        getStyleEl(row) {
            return row.querySelector('.styles-container')
        },

        run(editor) {
            const smEl = this.getStyleEl(this.getRowEl(editor))
            smEl.style.display = ''
        },
        stop(editor) {
            const smEl = this.getStyleEl(this.getRowEl(editor))
            smEl.style.display = 'none'
        },
    })

    editor.Commands.add('show-traits', {
        getRowEl() {
            return document.querySelector('.editor-right')
        },
        getStyleEl(row) {
            return row.querySelector('.traits-container')
        },

        run(editor) {
            const smEl = this.getStyleEl(this.getRowEl(editor))
            smEl.style.display = ''
        },
        stop(editor) {
            const smEl = this.getStyleEl(this.getRowEl(editor))
            smEl.style.display = 'none'
        },
    })
}
