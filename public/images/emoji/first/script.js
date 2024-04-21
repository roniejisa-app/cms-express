const listEventEmoji = [];

function emojiAll(url, totalRow, totalColumn, countLeftInTotalRow, ms) {
    const image = new Image();
    image.src = url;
    image.onload = () => {
        const emoji = document.createElement('div');
        emoji.className = "emoji";

        const widthOne = image.naturalWidth / totalColumn;
        const heightOne = image.naturalHeight / totalRow;
        emoji.style.backgroundImage = `url(${url})`
        emoji.style.height = heightOne + 'px';
        emoji.style.width = widthOne + 'px';
        emoji.style.backgroundPosition = `${0}px ${0}px`;
        emoji.setAttribute('width-one', widthOne);
        emoji.setAttribute('height-one', heightOne);
        emoji.setAttribute('count-left-in-total-row', countLeftInTotalRow);
        emoji.setAttribute('total-row', totalRow);
        emoji.setAttribute('total-column', totalColumn);
        emoji.setAttribute('ms', ms);
        document.body.append(emoji);
    }
}
window.addEventListener('event-emoji', e => {
    let emoji = e.element;
    let countLeftInTotalRow = emoji.getAttribute('count-left-in-total-row');
    let totalColumn = emoji.getAttribute('total-column');
    let totalRow = emoji.getAttribute('total-row');
    let ms = emoji.getAttribute('ms');
    let widthOne = emoji.getAttribute('width-one');
    let heightOne = emoji.getAttribute('height-one');
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

    !listEventEmoji[indexEmoji].interval && (listEventEmoji[indexEmoji].interval = setInterval(function () {
        if (countLeft === totalColumn || (countLeft === countLeftInTotalRow && countTop === totalRow - 1)) {
            countLeft = 0;
            countTop++;
        }
        if (countTop === totalRow) {
            countTop = 0;
            // console.log("reset");
        }
        // console.log(countLeft, countTop);
        emoji.style.backgroundPosition = `${-leftE}px ${-topE}px`;
        leftE = countLeft * +widthOne;
        topE = countTop * +heightOne;
        countLeft++;
    }, ms))
})
let listStickers = [
    [
        {
            id: 1,
            url: "/images/emoji/first/1.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        }, {
            id: 2,
            url: "/images/emoji/first/2.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        }, {
            id: 3,
            url: "/images/emoji/first/3.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        }, {
            id: 4,
            url: "/images/emoji/first/4.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        }, {
            id: 5,
            url: "/images/emoji/first/5.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        }, {
            id: 6,
            url: "/images/emoji/first/6.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        }, {
            id: 7,
            url: "/images/emoji/first/7.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        }, {
            id: 7,
            url: "/images/emoji/first/7.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        }, {
            id: 8,
            url: "/images/emoji/first/8.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        }, {
            id: 9,
            url: "/images/emoji/first/9.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        }, {
            id: 10,
            url: "/images/emoji/first/10.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        }, {
            id: 11,
            url: "/images/emoji/first/11.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        }, {
            id: 12,
            url: "/images/emoji/first/12.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        }, {
            id: 13,
            url: "/images/emoji/first/13.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        }, {
            id: 14,
            url: "/images/emoji/first/14.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        }, {
            id: 15,
            url: "/images/emoji/first/15.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        }, {
            id: 16,
            url: "/images/emoji/first/16.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        }, {
            id: 17,
            url: "/images/emoji/first/17.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        }, {
            id: 18,
            url: "/images/emoji/first/18.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        }, {
            id: 19,
            url: "/images/emoji/first/19.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        }, {
            id: 20,
            url: "/images/emoji/first/20.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        }, {
            id: 21,
            url: "/images/emoji/first/21.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        }, {
            id: 22,
            url: "/images/emoji/first/22.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        }, {
            id: 23,
            url: "/images/emoji/first/23.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        }, {
            id: 24,
            url: "/images/emoji/first/24.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        },
    ],
    [
        {
            id: 1,
            url: "/images/emoji/two/1.png",
            totalRow: 2,
            totalColumn: 3,
            countLeftInTotalRow: 3,
            ms: 100,
        },
        {
            id: 2,
            url: "/images/emoji/two/2.png",
            totalRow: 5,
            totalColumn: 5,
            countLeftInTotalRow: 1,
            ms: 100,
        },
        {
            id: 3,
            url: "/images/emoji/two/3.png",
            totalRow: 5,
            totalColumn: 5,
            countLeftInTotalRow: 4,
            ms: 100,
        },
        {
            id: 4,
            url: "/images/emoji/two/4.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 3,
            ms: 100,
        },
        {
            id: 5,
            url: "/images/emoji/two/5.png",
            totalRow: 2,
            totalColumn: 3,
            countLeftInTotalRow: 3,
            ms: 100,
        },
        {
            id: 6,
            url: "/images/emoji/two/6.png",
            totalRow: 2,
            totalColumn: 3,
            countLeftInTotalRow: 2,
            ms: 100,
        },
        {
            id: 7,
            url: "/images/emoji/two/7.png",
            totalRow: 2,
            totalColumn: 3,
            countLeftInTotalRow: 3,
            ms: 100,
        },
        {
            id: 8,
            url: "/images/emoji/two/8.png",
            totalRow: 2,
            totalColumn: 3,
            countLeftInTotalRow: 3,
            ms: 100,
        },
        {
            id: 9,
            url: "/images/emoji/two/9.png",
            totalRow: 2,
            totalColumn: 3,
            countLeftInTotalRow: 3,
            ms: 100,
        },
        {
            id: 10,
            url: "/images/emoji/two/10.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 3,
            ms: 100,
        },
        {
            id: 11,
            url: "/images/emoji/two/11.png",
            totalRow: 3,
            totalColumn: 3,
            countLeftInTotalRow: 2,
            ms: 100,
        },
        {
            id: 12,
            url: "/images/emoji/two/12.png",
            totalRow: 2,
            totalColumn: 3,
            countLeftInTotalRow: 3,
            ms: 100,
        },
        {
            id: 13,
            url: "/images/emoji/two/13.png",
            totalRow: 3,
            totalColumn: 3,
            countLeftInTotalRow: 2,
            ms: 100,
        },
        {
            id: 14,
            url: "/images/emoji/two/14.png",
            totalRow: 2,
            totalColumn: 3,
            countLeftInTotalRow: 3,
            ms: 100,
        },
        {
            id: 15,
            url: "/images/emoji/two/15.png",
            totalRow: 5,
            totalColumn: 5,
            countLeftInTotalRow: 2,
            ms: 100,
        },
        {
            id: 16,
            url: "/images/emoji/two/16.png",
            totalRow: 2,
            totalColumn: 3,
            countLeftInTotalRow: 3,
            ms: 100,
        },
        {
            id: 17,
            url: "/images/emoji/two/17.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        },
        {
            id: 18,
            url: "/images/emoji/two/18.png",
            totalRow: 7,
            totalColumn: 7,
            countLeftInTotalRow: 4,
            ms: 100,
        },
        {
            id: 19,
            url: "/images/emoji/two/19.png",
            totalRow: 4,
            totalColumn: 4,
            countLeftInTotalRow: 4,
            ms: 100,
        },
        {
            id: 20,
            url: "/images/emoji/two/20.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 3,
            ms: 100,
        }
    ],
    [
        {
            id: 1,
            url: "/images/emoji/three/1.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 3,
            ms: 100,
        },
        {
            id: 2,
            url: "/images/emoji/three/2.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 3,
            ms: 100,
        },{
            id: 3,
            url: "/images/emoji/three/3.png",
            totalRow: 4,
            totalColumn: 4,
            countLeftInTotalRow: 4,
            ms: 100,
        },{
            id: 4,
            url: "/images/emoji/three/4.png",
            totalRow: 4,
            totalColumn: 4,
            countLeftInTotalRow: 4,
            ms: 100,
        },{
            id: 4,
            url: "/images/emoji/three/4.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        },{
            id: 5,
            url: "/images/emoji/three/5.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 3,
            ms: 100,
        },{
            id: 6,
            url: "/images/emoji/three/6.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 3,
            ms: 100,
        },{
            id: 7,
            url: "/images/emoji/three/7.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 3,
            ms: 100,
        },{
            id: 8,
            url: "/images/emoji/three/8.png",
            totalRow: 4,
            totalColumn: 4,
            countLeftInTotalRow: 4,
            ms: 100,
        },{
            id: 9,
            url: "/images/emoji/three/9.png",
            totalRow: 4,
            totalColumn: 4,
            countLeftInTotalRow: 4,
            ms: 100,
        },{
            id: 10,
            url: "/images/emoji/three/10.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 3,
            ms: 100,
        },{
            id: 11,
            url: "/images/emoji/three/11.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 3,
            ms: 100,
        },{
            id: 12,
            url: "/images/emoji/three/12.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        },{
            id: 13,
            url: "/images/emoji/three/13.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        },{
            id: 14,
            url: "/images/emoji/three/14.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 3,
            ms: 100,
        },{
            id: 15,
            url: "/images/emoji/three/15.png",
            totalRow: 4,
            totalColumn: 4,
            countLeftInTotalRow: 2,
            ms: 100,
        },{
            id: 16,
            url: "/images/emoji/three/16.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 3,
            ms: 100,
        },{
            id: 17,
            url: "/images/emoji/three/17.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        },{
            id: 18,
            url: "/images/emoji/three/18.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 3,
            ms: 100,
        },{
            id: 19,
            url: "/images/emoji/three/19.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 3,
            ms: 100,
        },{
            id: 20,
            url: "/images/emoji/three/20.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 3,
            ms: 100,
        },{
            id: 21,
            url: "/images/emoji/three/21.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 3,
            ms: 100,
        },{
            id: 22,
            url: "/images/emoji/three/22.png",
            totalRow: 4,
            totalColumn: 5,
            countLeftInTotalRow: 5,
            ms: 100,
        },{
            id: 23,
            url: "/images/emoji/three/23.png",
            totalRow: 4,
            totalColumn: 4,
            countLeftInTotalRow: 4,
            ms: 100,
        },{
            id: 24,
            url: "/images/emoji/three/24.png",
            totalRow: 4,
            totalColumn: 4,
            countLeftInTotalRow: 4,
            ms: 100,
        }
    ]
]
emojiAll('../first/3.png', 4, 5, 5, 100);
emojiAll('../first/1.png', 4, 5, 5, 100);
emojiAll('../first/2.png', 4, 5, 5, 100);
emojiAll('../first/4.png', 4, 5, 5, 100);

document.addEventListener('mouseover', e => {
    if (e.target.classList.contains('emoji')) {
        eventEmojiAction.element = e.target;
        window.dispatchEvent(eventEmojiAction)
    }
})

document.addEventListener('mouseup', e => {
    console.log(listEventEmoji);
    listEventEmoji.forEach((emoji, index) => {
        setTimeout(() => {
            clearInterval(emoji.interval);
            emoji.interval = null;
        }, 5000);
    });
})

var eventEmojiAction = new Event("event-emoji");