function getSizeOfBoxUpload(elementContainer, ...elementSub) {
    let widthChild = 0;
    for (let i = 0; i < elementSub.length; i++) {
        widthChild += elementSub[i].offsetWidth;
    }
    const rectBoxImage = elementContainer.getBoundingClientRect();
    const widthParent = rectBoxImage.width;
    return {
        widthChild, rectBoxImage, widthParent
    }
}

export const createScrollbar = function (elementContainer, ...elementSub) {
    let scrollLeft = 0;
    let scrollRight = 0;
    let initialClientX = 0;
    let initialOffsetX = 0;
    // Tạo một MutationObserver instance
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            // Kiểm tra nếu có thêm phần tử con mới vào phần tử target
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // chỗ này kiểm tra xem có thanh scroll chưa thì thêm vào
                let { widthParent, widthChild, rectBoxImage } = getSizeOfBoxUpload(elementContainer, ...elementSub);
                let scrollEl = document.querySelector('.scroll-custom');
                let scrollBar;
                let diffScrollBar = widthChild - widthParent;
                if (diffScrollBar > 0 && !scrollEl) {
                    scrollEl = document.createElement('div');
                    scrollBar = document.createElement('div');
                    scrollEl.style.width = widthParent - 8 + 'px';
                    scrollEl.style.left = rectBoxImage.left + 4 + 'px';
                    scrollEl.style.top = rectBoxImage.top + rectBoxImage.height - 20 + 'px';
                    scrollEl.className = "scroll-custom";
                    scrollBar.className = "scroll-bar";
                    scrollEl.append(scrollBar);
                    document.body.append(scrollEl);

                    scrollEl.addEventListener('mousedown', (e) => {
                        let leftCurrent = e.offsetX - scrollBar.offsetWidth / 2;
                        let maxLeft = scrollEl.offsetWidth - scrollBar.offsetWidth;
                        let percent = leftCurrent / maxLeft * 100;
                        if (leftCurrent > maxLeft) {
                            leftCurrent = maxLeft;
                        }
                        if (leftCurrent < 0) {
                            leftCurrent = 0;
                        }
                        const scrollWidth = elementContainer.scrollWidth;
                        let allScrollReal = scrollWidth - scrollEl.offsetWidth;
                        let onePercentOfBoxImage = allScrollReal / 100;
                        let scrollReal = onePercentOfBoxImage * percent;
                        scrollEl.dataset.percent = percent;
                        scrollBar.style.left = leftCurrent + 'px';
                        elementContainer.scrollLeft = scrollReal;

                        // Test
                        initialClientX = e.clientX;
                        initialOffsetX = scrollBar.offsetWidth + scrollBar.offsetLeft;
                        scrollLeft = scrollBar.offsetLeft;
                        scrollRight = elementContainer.offsetWidth - (scrollBar.offsetWidth + scrollBar.offsetLeft);

                        document.addEventListener('mousemove', handleMovesScroll)
                    })

                    scrollBar.addEventListener('mousedown', (e) => {
                        e.stopPropagation();
                        initialClientX = e.clientX;
                        initialOffsetX = scrollBar.offsetWidth + scrollBar.offsetLeft;
                        scrollLeft = scrollBar.offsetLeft;
                        scrollRight = elementContainer.offsetWidth - (scrollBar.offsetWidth + scrollBar.offsetLeft);
                        document.addEventListener('mousemove', handleMovesScroll)
                    })

                    document.addEventListener('mouseup', () => {
                        document.removeEventListener('mousemove', handleMovesScroll)
                    })

                    window.addEventListener('before-resize-editor-chat', e => {
                        if (elementContainer && scrollEl) {
                            scrollEl.style.opacity = 0;
                        }
                    })

                    window.addEventListener('resize-editor-chat', e => {
                        if (elementContainer && scrollEl) {
                            let { widthParent, widthChild, rectBoxImage } = getSizeOfBoxUpload(elementContainer, ...elementSub);
                            scrollEl.style.width = widthParent - 8 + 'px';
                            scrollEl.style.left = rectBoxImage.left + 4 + 'px';
                            scrollEl.style.top = rectBoxImage.top + rectBoxImage.height - 20 + 'px';
                            if (scrollEl.dataset.percent) {
                                const rate = widthParent / widthChild;
                                scrollBar.style.width = widthParent * rate + 'px';
                                const maxLeft = scrollEl.offsetWidth - scrollBar.offsetWidth;
                                scrollBar.style.left = maxLeft / 100 * +scrollEl.dataset.percent + 'px';
                            }
                            scrollEl.style.opacity = 1;
                        }
                    })

                    function handleMovesScroll(e) {
                        let dragSpace = e.clientX - initialClientX;
                        let leftCurrent = scrollLeft + dragSpace;
                        let maxLeft = scrollEl.offsetWidth - scrollBar.offsetWidth;
                        if (leftCurrent > maxLeft) {
                            leftCurrent = maxLeft;
                        }

                        if (leftCurrent < 0) {
                            leftCurrent = 0;
                        }
                        const scrollWidth = elementContainer.scrollWidth;
                        let percent = leftCurrent / maxLeft * 100;
                        let allScrollReal = scrollWidth - scrollEl.offsetWidth;
                        let onePercentOfBoxImage = allScrollReal / 100;
                        let scrollReal = onePercentOfBoxImage * percent;
                        scrollEl.dataset.percent = percent;
                        scrollBar.style.left = leftCurrent + 'px';
                        elementContainer.scrollLeft = scrollReal;
                    }
                } else if (scrollEl) {
                    scrollBar = scrollEl.firstElementChild
                }
                if (scrollBar) {
                    // Nếu kích thước của phần tử con > kích thước phần tử cha 2px
                    /*
                        Tính tỉ lệ cách lấy chiều rộng ngoài chia cho chiều rộng thực 
                        
                        Tính độ dài của thanh scroll lấy tỉ lệ nhân với chiều rộng
                    */
                    const rate = widthParent / widthChild;
                    scrollBar.style.width = widthParent * rate + 'px';
                }
            }
        });
    });

    // Thiết lập options cho MutationObserver (theo dõi các thay đổi trong phần tử con và các thay đổi trong thuộc tính của phần tử con)
    const config = { childList: true, subtree: true };

    // Bắt đầu theo dõi phần tử target với các options đã thiết lập
    observer.observe(elementContainer, config);
}
export const resizeEditorChat = new Event("resize-editor-chat");
export const beforeResizeEditorChat = new Event("before-resize-editor-chat");
export default {}