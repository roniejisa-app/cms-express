const MEDIA = (() => {
    async function showMedia(e, imageForm, buttonChooseImage) {
        const iframeContainer = document.createElement('div')
        iframeContainer.className = 'media-box'
        const loading = document.createElement('div')
        Object.assign(iframeContainer.style, {
            display: 'flex',
            position: 'fixed',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,.2)',
            zIndex: 10000,
            inset: 0,
        })
        Object.assign(loading.style, {
            height: '40px',
            width: '40px',
            borderStyle: 'solid',
            borderRadius: '50%',
            borderWidth: '4px',
            borderColor: 'transparent coral coral coral',
        })

        loading.animate(
            [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
            {
                iterations: Infinity,
                easing: 'linear',
                duration: 300,
            }
        )

        iframeContainer.append(loading)
        document.body.append(iframeContainer)
        const iframeImage = document.createElement('iframe')
        iframeImage.setAttribute('src', '/admin/medias')
        Object.assign(iframeImage.style, {
            width: '0',
            height: '0',
            borderRadius: '6px',
            border: 'none',
            boxShadow: '0 0 6px white',
        })
        iframeContainer.append(iframeImage)
        iframeImage.dataset.uuid = imageForm.dataset.id
        iframeImage.dataset.type = buttonChooseImage.dataset.type
        iframeImage.onload = function () {
            loading.remove()
            Object.assign(iframeImage.style, {
                width: '90vw',
                height: '90vh',
            })
        }
        iframeContainer.addEventListener('click', function (e) {
            iframeContainer.remove()
        })
    }

    function removeImage(imageForm) {
        const imgEl = imageForm.querySelector('img')
        imgEl.src = '/images/admin/no-image.svg'
        const textarea = imageForm.querySelector('textarea')
        textarea.innerText = ''
        textarea.dispatchEvent(new Event('change'))
    }

    return {
        init: () => {
            const imageFormEls = document.querySelectorAll('.image-form')
            imageFormEls.forEach((imageForm) => {
                let uniqueId =
                    Date.now().toString(36) +
                    Math.random().toString(36).substring(2)
                imageForm.dataset.id = uniqueId
                const buttonChooseImage =
                    imageForm.querySelector('.btn-choose-image')
                const buttonRemoveImage =
                    imageForm.querySelector('.btn-remove-image')
                imageForm.addEventListener('click', () => {
                    buttonChooseImage.click()
                })
                buttonChooseImage.addEventListener('click', (e) => {
                    e.stopPropagation()
                    showMedia(e, imageForm, buttonChooseImage)
                })
                buttonRemoveImage.addEventListener('click', (e) => {
                    e.stopPropagation()
                    removeImage(imageForm)
                })
            })
        },
        event: () => {
            window.addEventListener('choose-image', function (e) {
                const data = e.data
                const type = e.typeImage
                const imageFormEl = document.querySelector(
                    `.image-form[data-id="${e.uuid}"]`
                )
                const textarea = imageFormEl.querySelector('textarea')
                switch (type) {
                    case 'last':
                        const imageData = JSON.parse(data)
                        textarea.innerText = data
                        textarea.dispatchEvent(new Event('change'))
                        const imageEl = imageFormEl.querySelector('img')
                        imageEl.src = '/' + imageData.path_absolute
                        break
                }
                const iframeBox = document.querySelector('.media-box')
                iframeBox.remove()
            })
        },

        loadFrame: showMedia,
    }
})()
export default MEDIA
