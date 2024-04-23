function emojiAll(url, imageUrl, totalRow, totalColumn, countLeftInTotalRow, ms, isRate = 1) {
    const image = new Image();
    image.src = url;
    let emoji;
    return new Promise(resolve => {
        image.onload = () => {
            emoji = document.createElement('div');
            emoji.className = "emoji";
            const widthOne = image.naturalWidth / totalColumn;
            const heightOne = image.naturalHeight / totalRow;
            emoji.style.backgroundImage = `url(${url})`
            emoji.style.height = heightOne / isRate + 'px';
            emoji.style.width = widthOne / isRate + 'px';
            emoji.style.backgroundPosition = `${0}px ${0}px`;
            emoji.setAttribute('width-one', widthOne);
            emoji.setAttribute('height-one', heightOne);
            emoji.setAttribute('count-left-in-total-row', countLeftInTotalRow);
            emoji.setAttribute('total-row', totalRow);
            emoji.setAttribute('total-column', totalColumn);
            emoji.setAttribute('ms', ms);
            emoji.setAttribute('image-url', imageUrl);
            resolve(emoji);
        }
    })
}

export default {
    emojiAll,
    addEventEmoji: (element) => {
        const listEventEmoji = [];
        window.addEventListener("event-emoji-" + element.className, e => {
            const emoji = e.element;
            const countLeftInTotalRow = emoji.getAttribute('count-left-in-total-row');
            const totalColumn = emoji.getAttribute('total-column');
            const totalRow = emoji.getAttribute('total-row');
            const ms = emoji.getAttribute('ms');
            const widthOne = emoji.getAttribute('width-one');
            const heightOne = emoji.getAttribute('height-one');
            let leftE = 0;
            let topE = 0;
            let countLeft = 0;
            let countTop = 0;
            let indexEmoji = listEventEmoji.findIndex(({ element }) => element === emoji);
            if (indexEmoji === -1) {
                indexEmoji = listEventEmoji.length;
                listEventEmoji[indexEmoji] = {
                    element: emoji,
                    interval: null
                };
            }

            listEventEmoji[indexEmoji].countInterval = 0;

            !listEventEmoji[indexEmoji].interval && (listEventEmoji[indexEmoji].interval = setInterval(function () {
                if (+countLeft === +totalColumn || (+countLeft === +countLeftInTotalRow && +countTop === totalRow - 1)) {
                    countLeft = 0;
                    +countTop++;
                }
                if (countTop === +totalRow) {
                    countTop = 0;
                    // console.log("reset");
                }
                if (leftE === 0 && topE === 0) {
                    if (listEventEmoji[indexEmoji].countInterval >= 5) {
                        clearInterval(listEventEmoji[indexEmoji].interval)
                        listEventEmoji[indexEmoji].interval = null;
                    }
                    listEventEmoji[indexEmoji].countInterval++;
                }
                emoji.style.backgroundPosition = `${-leftE}px ${-topE}px`;
                leftE = +countLeft * +widthOne;
                topE = +countTop * +heightOne;
                +countLeft++;
            }, ms))
        })

        window.addEventListener('mouseover', e => {
            let emojiEl = e.target;
            if (emojiEl.closest(".emoji")) {
                emojiEl = emojiEl.closest(".emoji");
            }
            if (emojiEl.classList.contains('emoji')) {
                eventEmojiAction.element = emojiEl;
                window.dispatchEvent(eventEmojiAction)
            }
        })
        var eventEmojiAction = new Event("event-emoji-" + element.className);
    },
    runEmojiForElement: (emoji) => {
        if (emoji.dataset.running) {
            return false
        }
        emoji.dataset.running = true;
        const countLeftInTotalRow = emoji.getAttribute('count-left-in-total-row');
        const totalColumn = emoji.getAttribute('total-column');
        const totalRow = emoji.getAttribute('total-row');
        const ms = emoji.getAttribute('ms');
        const widthOne = emoji.getAttribute('width-one');
        const heightOne = emoji.getAttribute('height-one');
        let leftE = 0;
        let topE = 0;
        let countLeft = 0;
        let countTop = 0;

        setInterval(function () {
            if (+countLeft === +totalColumn || (+countLeft === +countLeftInTotalRow && +countTop === totalRow - 1)) {
                countLeft = 0;
                +countTop++;
            }
            if (countTop === +totalRow) {
                countTop = 0;
            }
            emoji.style.backgroundPosition = `${-leftE}px ${-topE}px`;
            leftE = +countLeft * +widthOne;
            topE = +countTop * +heightOne;
            +countLeft++;
        }, ms)
    }
}