export const eventClick = {
    onclick: (e, value, element, ...params) => {
        e.stopPropagation()
        if (element.classList.contains('active')) {
            element.classList.remove('active')
        } else {
            element.classList.add('active')
        }
        backRange(...params)
        document.execCommand(value, false, null)
    },
}
export const eventClickNoActive = {
    onclick: (e, value, element, ...params) => {
        e.stopPropagation()
        backRange(...params)
        console.log(value);
        document.execCommand(value, false, null)
    },
}

export const eventChangeFontSize = {
    onchange: (e, value, element, ...params) => {
        backRange(...params)
        document.execCommand('fontSize', false, e.target.value)
    },
}

export const eventChangeFontStyle = {
    onchange: (e, value, element, ...params) => {
        backRange(...params)
        document.execCommand('foreColor', false, e.target.value)
    },
}

function backRange(shadow, range) {
    if (range) {
        const selection = shadow.getSelection()

        selection.removeAllRanges()
        selection.addRange(range)
        
    }
    dispatchData(shadow);
}

export const dispatchData = (shadow) => {
    const content = shadow.querySelector('.content');
    const nameInsertValue = content.dataset.name;
    const el = document.querySelector(`[name="${nameInsertValue}"]`);
    el.innerHTML = content.innerHTML;
}