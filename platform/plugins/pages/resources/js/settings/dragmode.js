export const dragMode = (editor) => {
    const labelStatic = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" style="height:14px"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>`;
    const labelAbsolute = `<svg  style="height:14px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M16 144a144 144 0 1 1 288 0A144 144 0 1 1 16 144zM160 80c8.8 0 16-7.2 16-16s-7.2-16-16-16c-53 0-96 43-96 96c0 8.8 7.2 16 16 16s16-7.2 16-16c0-35.3 28.7-64 64-64zM128 480V317.1c10.4 1.9 21.1 2.9 32 2.9s21.6-1 32-2.9V480c0 17.7-14.3 32-32 32s-32-14.3-32-32z"/></svg>`;

    editor.on('component:selected', (component, event) => {
        const dragModeAbsolute = component.getDragMode() === 'absolute';
        component.toolbar.unshift({
            attributes: {
                class: 'gjs-no-touch-actions',
                draggable: true,
            },
            label: dragModeAbsolute ? labelAbsolute : labelStatic,
            command: 'tlb-dragMode',
        })
    })

    editor.on('component:deselected', (component, event) => {
        if (component.toolbar.length === 5) {
            component.toolbar.splice(0, 1)
        }
    })

    editor.Commands.add('tlb-dragMode', {
        run: (editor) => {
            const component = editor.getSelected()
            const { dragMode } = component.getAttributes()
            component.toolbar.splice(0, 1)
            const defaultToolbar = component.toolbar
            console.log(defaultToolbar)
            if (!dragMode) {
                component.setDragMode('absolute')
                component.setAttributes({
                    dragMode: true,
                })
                component.set({
                    toolbar: [
                        {
                            attributes: {
                                class: 'gjs-no-touch-actions',
                                draggable: true,
                            },
                            label: labelAbsolute,
                            command: 'tlb-dragMode',
                        },
                        ...defaultToolbar,
                    ],
                })
            } else {
                component.setDragMode('')
                component.removeAttributes('dragMode')
                component.set({
                    toolbar: [
                        {
                            attributes: {
                                class: 'gjs-no-touch-actions',
                                draggable: true,
                            },
                            label: labelStatic,
                            command: 'tlb-dragMode',
                        },
                        ...defaultToolbar,
                    ],
                })
            }
        },
    })
}
