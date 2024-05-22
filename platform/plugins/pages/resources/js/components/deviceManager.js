export const deviceManager = () => {
    // Thay đổi giữa các kiểu màn hình
    return {
        devices: [
            {
                name: 'Desktop',
                width: '', // default size
            },
            {
                name: 'Tablet',
                width: '768px', // this value will be used on canvas width
                widthMedia: '810px', // this value will be used in CSS @media
            },
            {
                name: 'Mobile',
                width: '320px', // this value will be used on canvas width
                widthMedia: '480px', // this value will be used in CSS @media
            },
        ],
    }
}

export const deviceCommand = (editor) => {
    editor.Commands.add('set-device-desktop', {
        run: (editor, sender, option) => {
            editor.setDevice('Desktop')
        },
        stop: (editor, sender) => {},
    })
    editor.Commands.add('set-device-mobile', {
        run: (editor, sender, option) => {
            editor.setDevice('Mobile')
        },
        stop: (editor, sender) => {},
    })
    editor.Commands.add('set-device-tablet', {
        run: (editor, sender, option) => {
            editor.setDevice('Tablet')
        },
        stop: (editor, sender) => {},
    })
}