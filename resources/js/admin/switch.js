const TOGGLESWITCH = (() => {
    const init = () => {
        const switchEls = document.querySelectorAll('.switch')
        for (let switchEl of switchEls) {
            const inputEl = switchEl.querySelector('input[type="checkbox"]')
            const inputMain = switchEl.querySelector('input[type="hidden"]')
            inputEl.onchange = () => {
                inputMain.value = inputEl.checked ? 1 : 0
            }
        }
    }
    return {
        init,
    }
})()

export default TOGGLESWITCH
