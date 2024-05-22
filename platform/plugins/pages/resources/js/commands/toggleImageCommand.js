export const toggleImageCommand = (editor) => {
    editor.Commands.add('gjs-toggle-images', {
        run(editor) {
            const components = editor.getComponents()
            this.toggleImages(components)
        },

        stop(editor) {
            const components = editor.getComponents()
            this.toggleImages(components, true)
        },

        toggleImages(components, on = false) {
            const srcPlh = '##'
            components.forEach((component) => {
                if (component.get('type') === 'image') {
                    const source = component.get('src')

                    if (on) {
                        if (source === srcPlh) {
                            component.set('src', component.get('src_bkp'))
                        }
                    } else if (source !== srcPlh) {
                        component.set('src_bkp', component.get('src'))
                        component.set('src', srcPlh)
                    }
                }

                this.toggleImages(component.components(), on)
            })
        },
    })
}
