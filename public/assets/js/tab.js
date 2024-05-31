const TAB = (() => {
    const tabButtons = document.querySelectorAll('[data-key-tab]')
    if (!tabButtons) return
    const tabs = document.querySelectorAll('[data-tab]')

    for (let tabEl of tabs) {
        tabEl.addEventListener('show-tab', (e) => {
            tabEl.classList.add('active')
        })
        tabEl.addEventListener('hide-tab', (e) => {
            tabEl.classList.remove('active')
        })
    }

    for (let tabEl of tabButtons) {
        tabEl.onclick = (e) => {
            const keyTab = tabEl.getAttribute('data-key-tab')
            const tabButtonActive = document.querySelector(
                `[data-key-tab].active`
            )

            if (tabButtonActive === tabEl) return
            // Ẩn tab cũ
            tabButtonActive.classList.remove('active')
            const tabActive = document.querySelector('[data-tab].active')
            tabActive.dispatchEvent(new CustomEvent('hide-tab'))
            // Show tab mới
            tabEl.classList.add('active')
            const tab = document.querySelector(`[data-tab="${keyTab}"]`)
            tab.dispatchEvent(new CustomEvent('show-tab'))
        }
    }
})()

export default TAB
