
export const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export const getBase64 = (file) => {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            resolve(reader.result);
        };
        reader.onerror = function (error) {
            resolve(error);
        };
    })
}

export const eD = (data) => {
    let randomString = Math.random().toString(36).toString(36).substring(2) + new Date().getTime().toString(36).substring(2);
    let startString = randomString.slice(3, 8);
    let endString = randomString.slice(9, 15);
    data = btoa(btoa(endString + btoa(startString + btoa(encodeURIComponent(JSON.stringify(data))) + endString).split("").reverse().join("-") + startString).split("").reverse().join("?"));
    return data;
}

export const dD = (base64Data) => {
    let firstDecode = atob(atob(base64Data).split("?").reverse().join(""));
    let secondDecode = atob(firstDecode.slice(6, -5).split("-").reverse().join(""));
    let threeDecode = atob(secondDecode.slice(5, -6));
    let data = JSON.parse(decodeURIComponent(threeDecode));
    return data;
}

export const randomId = () => {
    let randomString = Math.random().toString(36).toString(36).substring(2) + new Date().getTime().toString(36).substring(2);
    return randomString;
}