function emojiAll(url, totalRow, totalColumn, countLeftInTotalRow, ms, isRate = 1) {
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
            emoji.style.width = widthOne / isRate+ 'px';
            emoji.style.backgroundPosition = `${0}px ${0}px`;
            emoji.setAttribute('width-one', widthOne);
            emoji.setAttribute('height-one', heightOne);
            emoji.setAttribute('count-left-in-total-row', countLeftInTotalRow);
            emoji.setAttribute('total-row', totalRow);
            emoji.setAttribute('total-column', totalColumn);
            emoji.setAttribute('ms', ms);
            resolve(emoji);
        }
    })
}
const emojiEl = emojiAll('./first/3.png', 4, 5, 5, 100);

