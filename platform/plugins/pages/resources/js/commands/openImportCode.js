export const importCode = (editor) => {
    const cmdm = editor.Commands
    const pfx = editor.getConfig().stylePrefix

    cmdm.add('gjs-open-import-template', {
        containerEl: null,
        codeEditorHtml: null,

        createCodeViewer() {
            return editor.CodeManager.createViewer({
                codeName: 'htmlmixed',
                theme: 'hopscotch',
                readOnly: false,
            })
        },

        createCodeEditor() {
            const el = document.createElement('div')
            const codeEditor = this.createCodeViewer()

            el.style.flex = '1 0 auto'
            el.style.boxSizing = 'border-box'
            el.className = `${pfx}import-code`
            el.appendChild(codeEditor.getElement())

            return { codeEditor, el }
        },

        getCodeContainer() {
            let containerEl = this.containerEl

            if (!containerEl) {
                containerEl = document.createElement('div')
                containerEl.className = `${pfx}import-container`
                containerEl.style.display = 'flex'
                containerEl.style.gap = '5px'
                containerEl.style.flexDirection = 'column'
                containerEl.style.justifyContent = 'space-between'
                this.containerEl = containerEl
            }

            return containerEl
        },

        run(editor) {
            const container = this.getCodeContainer()
            let { codeEditorHtml } = this
            // Init code viewer if not yet instantiated
            if (!codeEditorHtml) {
                const codeViewer = this.createCodeEditor();
                const btnImp = document.createElement('button')
                codeEditorHtml = codeViewer.codeEditor;
                this.codeEditorHtml = codeEditorHtml

                if ("Paste all your code here below and click import") {
                    let labelEl = document.createElement('div')
                    labelEl.className = `${pfx}import-label`
                    labelEl.innerHTML = 'Paste all your code here below and click import'
                    container.appendChild(labelEl)
                }

                // Init import button
                btnImp.innerHTML = 'Import'
                btnImp.type = 'button'
                btnImp.className = `${pfx}btn-prim ${pfx}btn-import`
                btnImp.style.alignSelf = 'flex-start'
                btnImp.onclick = () => {
                    const code = codeViewer.codeEditor.editor.getValue()
                    editor.Components.clear()
                    editor.Css.clear()
                    editor.setComponents(code)
                    editor.Modal.close()
                }

                container.appendChild(codeViewer.el)
                container.appendChild(btnImp)
            }

            editor.Modal.open({
                title: 'Import template',
                content: container,
            })

            if (codeEditorHtml) {
                codeEditorHtml.setContent(`<table class="table"><tr><td class="cell">Hello world!</td></tr></table>`||'')
                codeEditorHtml.editor.refresh()
            }
        },
    })
}
