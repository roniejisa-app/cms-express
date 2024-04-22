const list = { ":*": "😘", ":O": "😮", ":v": "🤣", ":(": "😞", ":d": "😁", ":D": "😁", ":x": "😆", ":)": "😊", "=)": "😂" }
export const convertStringToEmoji = function (string) {
    let check = false;
    for (const [key, value] of Object.entries(list)) {
        if (string.includes(key)) {
            string = string.replace(key, value);
            check = true;
        }
    }
    if (check) {
        return string;
    } else {
        return check;
    }
}

export default {

}