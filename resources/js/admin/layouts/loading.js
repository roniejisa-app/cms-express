const LOADING = (() => {
    const loadingEl = document.querySelector('.cms-loading')
    if (!loadingEl) return
    return {
        show(...els) {
            if (els.length > 0) {
                for (const el of els) {
                    el.style.pointerEvents = 'none'
                }
            }
            loadingEl.classList.add('show')
        },
        hide(...els) {
            if (els.length > 0) {
                for (const el of els) {
                    el.style.pointerEvents = null
                }
            }
            loadingEl.classList.remove('show')
        },
    }
})()

export default LOADING
