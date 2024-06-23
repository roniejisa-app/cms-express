import request from './../js/utils/request'
const INSTALL_PLUGIN = (() => {
    const btnInstall = document.querySelectorAll('.btn-install')
    for (const btn of btnInstall) {
        btn.addEventListener('click', (e) => {
            e.preventDefault()
            const pluginName = btn.getAttribute('data-name')
            btn.innerText = 'Đang cài đặt...'
            request
                .post(import.meta.env.VITE_AP+'/plugin/install', {
                    name: pluginName,
                })
                .then((response) => {
                    btn.innerText = 'Đã cài đặt'
                })
                .catch((error) => {
                    btn.innerText = 'Cài đặt'
                })
        })
    }
})()
