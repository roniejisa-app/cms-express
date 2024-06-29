import DragField from '../utils/drag'
import { randomId } from '../utils/utils'

const MEDIA = (() => {
    async function showMedia(e, imageForm) {
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
        iframeImage.setAttribute('src', import.meta.env.VITE_AP + '/medias')
        Object.assign(iframeImage.style, {
            width: '0',
            height: '0',
            borderRadius: '6px',
            border: 'none',
            boxShadow: '0 0 6px white',
        })
        iframeContainer.append(iframeImage)
        iframeImage.dataset.uuid = imageForm.dataset.id
        iframeImage.dataset.type = imageForm.dataset.type
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

    function removeGallery(imageForm) {
        const gallery = imageForm.querySelector('.cms-gallery')
        gallery.innerHTML = ''
        const textarea = imageForm.querySelector('textarea')
        textarea.innerText = ''
        textarea.dispatchEvent(new Event('change'))
    }

    function removeImageMultiple(galleryEl, textareaEl) {
        const items = galleryEl.querySelectorAll('.btn-remove-gallery')
        const obj = JSON.parse(textareaEl.innerText)
        for (let item of items) {
            item.onclick = (e) => {
                e.stopPropagation();
                const imageItem = item.parentElement;
                const id = imageItem.dataset.id
                const index = obj.findIndex((item) => {
                    const dataItem = JSON.parse(item)
                    return dataItem.uniqueId === id
                })
                if (index !== -1) {
                    obj.splice(index, 1)
                }
                textareaEl.innerText = obj.length > 0 ? JSON.stringify(obj) : "";
                textareaEl.dispatchEvent(new Event('change'))
                imageItem.remove();
            }
        }
    }
    return {
        init: () => {
            const imageFormEls = document.querySelectorAll('.image-form')
            imageFormEls.forEach((imageForm) => {
                let uniqueId = randomId()
                imageForm.dataset.id = uniqueId
                const type = imageForm.dataset.type
                const buttonChooseImage =
                    imageForm.querySelector('.btn-choose-image')
                const buttonRemoveImage =
                    imageForm.querySelector('.btn-remove-image')
                imageForm.addEventListener('click', () => {
                    buttonChooseImage.click()
                })
                const textareaEl = imageForm.querySelector('textarea')
                if (type === 'multiple' && textareaEl.innerHTML !== '') {
                    const galleryEl = imageForm.querySelector('.cms-gallery');
                    new DragField(
                        galleryEl,
                        textareaEl,
                        '.cms-gallery-item'
                    ).init()
                    removeImageMultiple(galleryEl, textareaEl)
                }
                buttonChooseImage.addEventListener('click', (e) => {
                    e.stopPropagation()
                    showMedia(e, imageForm, buttonChooseImage)
                })
                buttonRemoveImage.addEventListener('click', (e) => {
                    e.stopPropagation()
                    // Kiểm tra xem có ảnh hay không đã
                    if (textareaEl.innerHTML === '') return
                    if (!confirm('Xóa ảnh')) return
                    switch (type) {
                        case 'last':
                            removeImage(imageForm)
                            break
                        case 'multiple':
                            removeGallery(imageForm)
                            break
                    }
                })
            })
        },
        event: () => {
            window.addEventListener('choose-image', function (e) {
                const data = e.data
                const type = e.typeImage
                // Cái này để lấy ra field hiện tại của danh sách ảnh
                const imageFormEl = document.querySelector(
                    `.image-form[data-id="${e.uuid}"]`
                )
                const textarea = imageFormEl.querySelector('textarea')
                switch (type) {
                    case 'last':
                        const imageData = JSON.parse(data)
                        const imageEl = imageFormEl.querySelector('img')
                        imageEl.src = '/' + imageData.path_absolute
                        textarea.innerText = data
                        break
                    case 'multiple':
                        const galleryEl =
                            imageFormEl.querySelector('.cms-gallery')
                        data.forEach((image) => {
                            const imageData = JSON.parse(image)
                            const imageEl = document.createElement('div')
                            imageEl.className = 'cms-gallery-item'
                            imageEl.dataset.id = imageData.uniqueId
                            imageEl.innerHTML = `
                                <img src="/${imageData.path_absolute}" />
                                <button type="button" class="btn-remove-gallery" data-id="${imageData.id}">&times;</button>
                            `
                            galleryEl.append(imageEl)
                        })
                        if (textarea.innerText !== '') {
                            const old = JSON.parse(textarea.innerText)
                            textarea.innerText = JSON.stringify([
                                ...old,
                                ...data,
                            ])
                        } else {
                            textarea.innerText = JSON.stringify(data)
                        }
                        new DragField(
                            galleryEl,
                            textarea,
                            '.cms-gallery-item'
                        ).init()
                        removeImageMultiple(galleryEl, textarea)
                        break
                }

                textarea.dispatchEvent(new Event('change'))
                const iframeBox = document.querySelector('.media-box')
                iframeBox.remove()
            })
        },

        loadFrame: showMedia,
    }
})()
export default MEDIA
