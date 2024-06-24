import request from './../js/utils/request'
const INSTALL_PLUGIN = (() => {
    const btnInstall = document.querySelectorAll('.btn-install')
    for (const btn of btnInstall) {
        btn.addEventListener('click', (e) => {
            e.preventDefault()
            const pluginName = btn.getAttribute('data-name')
            const pluginType = btn.getAttribute('data-type')
            if (pluginType === 'install') {
                btn.innerText = 'Đang cài đặt...'
            }
            if (pluginType === 'uninstall') {
                btn.innerText = 'Đang hủy...'
            }
            request
                .post(import.meta.env.VITE_AP + '/plugin-i/' + pluginType, {
                    name: pluginName,
                })
                .then((response) => {
                    if (pluginType === 'install') {
                        btn.dataset.type = 'uninstall'
                        btn.innerText = 'Đã cài đặt'
                    }
                    if (pluginType === 'uninstall') {
                        btn.dataset.type = 'install'
                        btn.innerText = 'Cài đặt'
                    }
                })
                .catch((error) => {
                    btn.innerText = 'Cài đặt'
                })
        })
    }
})()
