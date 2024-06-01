const MODAL = (() => {
    const modalEls = document.querySelectorAll('[data-modal]')
    const buttonToggleModal = document.querySelectorAll('[data-btn-modal]')

    return {
        init: () => {
            if(!modalEls) return false;
            for (const modalEl of modalEls) {
                modalEl.addEventListener('modal-show', (e) => {
                    modalEl.classList.add('show')
                })

                modalEl.addEventListener('modal-close', (e) => {
                    modalEl.classList.remove('show')
                })

                const modalCloses = modalEl.querySelectorAll('[data-btn-close]')
                for (const btnClose of modalCloses) {
                    btnClose.addEventListener('click', (e) => {
                        modalEl.dispatchEvent(new CustomEvent('modal-close'))
                    })
                }
            }

            for (const modalEl of buttonToggleModal) {
                modalEl.addEventListener('click', (e) => {
                    const nameModal = modalEl.dataset.btnModal
                    const modal = document.querySelector(
                        `[data-name-modal='${nameModal}']`
                    )
                    modal.dispatchEvent(new CustomEvent('modal-show'))
                })
            }
        },
    }
})()

export default MODAL
