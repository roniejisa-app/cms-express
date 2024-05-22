export const eventManager = (editor) => {
    editor.on('run:export-template:before', (opts) => {
        console.log('Before the command run')
        if (0 /* some condition */) {
            opts.abort = 1
        }
    })
    editor.on('run:export-template', () => console.log('After the command run'))
    editor.on('abort:export-template', () => console.log('Command aborted'))
    var em = editor.getModel();
    em.listenTo(em, "change:device", function() {
        em.runDefault({ preserveSelected: 1 });
    });
}
