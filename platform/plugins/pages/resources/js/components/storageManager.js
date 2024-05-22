export const storeManager = (ENDPOINT, id) => {
    return {
        type: 'remote', // Type of the storage, available: 'local' | 'remote'
        autosave: true, // Store data automatically
        autoload: true, // Autoload stored data on init
        stepsBeforeSave: 1, // If autosave enabled, indicates how many changes are necessary before store method is triggered
        options: {
            remote: {
                // Options for the `local` type
                key: 'gjsProject', // The key for the local storage
                urlStore: `${ENDPOINT}/store`, // Endpoint URL where to store data project
                onStore: (data, editor) => {
                    const pagesHtml = editor.Pages.getAll().map((page) => {
                        const component = page.getMainComponent()
                        return {
                            html: editor.getHtml({ component }),
                            css: editor.getCss({ component }),
                        }
                    })
                    return { id: id, data, pagesHtml }
                },
                onLoad: result => {
                    return result.data
                },
                urlLoad: `${ENDPOINT}/load/${id}`, // Endpoint URL where to load data project
            },
        },
    }
}
