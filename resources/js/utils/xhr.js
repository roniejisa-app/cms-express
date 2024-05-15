const eventUpdateProcess = new Event('update-process-event');

const XHR = {
    headers: {
        'Content-Type': 'application/json'
    },
    eventUploads: {
    },
    body: {},
    params: {},
    endpoint: '',
    type: '',
    send: function (method, url, body = {}) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            // SET Event Upload
            for (const [eventName, cb] of Object.entries(this.eventUploads)) {
                xhr.upload.addEventListener(eventName, cb);
            }

            this.setBody(body);
            if (this.type === "") {
                this.setHeader('Content-Type', 'application/json')
            } else if (this.type === "form") {
                this.setHeader('Content-Type', 'application/x-www-form-urlencoded')
            } else if (this.type === "formData") {
                this.setHeader("Content-Type", "multipart/form-data")
            }

            xhr.addEventListener('progress', function (e) {
                let percent = +((e.loaded / e.total) * 100).toFixed(2);
                let divProgress = document.body.querySelector('.progress-upload');
                if (!document.body.querySelector('.progress-upload')) {
                    divProgress = document.createElement('div');
                    divProgress.className = 'progress-upload';
                    divProgress.innerHTML = `<span></span>
                                        <svg width="100" height="100" viewBox="0 0 100 100" class="circular-progress">
                                            <defs>
                                            <linearGradient id="GradientColor">
                                                <stop offset="0%" stop-color="yellow"></stop>
                                                <stop offset="50%" stop-color="red"></stop>
                                                <stop offset="100%" stop-color="#80afe7"></stop>
                                            </linearGradient>
                                            </defs>
                                            <circle class="bg"></circle>
                                            <circle class="fg"></circle>
                                        </svg>`
                    document.body.append(divProgress);
                }
                const spanPercent = divProgress.querySelector('span');
                const circle = divProgress.querySelector('.circular-progress');
                circle.style.setProperty('--progress', percent);
                spanPercent.innerText = `${percent}%`;
                if (percent === 100) {
                    divProgress.animate([{
                        opacity: 1
                    }, {
                        opacity: 0
                    }], {
                        duration: 1000,
                        easing: "ease-in-out"
                    }).finished.then(function () {
                        divProgress.remove();
                    })
                }
            });

            xhr.responseType = "json";

            xhr.onreadystatechange = () => {
                // Call a function when the state changes.
                if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                    resolve(xhr.response)
                }
            };

            xhr.addEventListener('process', (e) => {
                dispatchEvent(event)
            })


            let params = this.getParams();
            let urlEndpoint = this.endpoint + url + (params ? '?' + params : '');
            let data = this.buildBody();
            xhr.open(method, urlEndpoint);

            // Thêm thông tin header
            if (Object.keys(this.headers).length) {
                for (let key of Object.keys(this.headers)) {
                    if (this.type === "formData" && key === "Content-Type") {
                    } else {
                        xhr.setRequestHeader(key, this.headers[key]);
                    }
                }
            }
            xhr.send(data);
        })
    },
    setEventUpload: function (event, cb) {
        this.eventUploads[event] = cb;
    },
    setType: function (type) {
        this.type = type
    },
    buildBody: function () {
        if (this.type === 'formData' || this.type === 'formExpress') {
            const newFormData = new FormData();
            for (let key of Object.keys(this.body)) {
                if (Array.isArray(this.body[key])) {
                    for (const value of this.body[key]) {
                        newFormData.append(key, value);
                    }
                } else {
                    newFormData.append(key, XHR.body[key]);
                }
            }
            return newFormData;
        } else {
            return JSON.stringify(this.body);
        }
    },
    setBody: function (body) {
        this.body = body;
    },
    getParams: function () {
        return Object.entries(this.params).map(([key, value]) => `${key}=${value}`).join('&');
    },
    setParams: function (key, value) {
        this.params[key] = value;
    },
    setHeader: function (key, value) {
        this.headers[key] = value;
    },
    setEndpoint: function (value) {
        this.endpoint = value;
    },
    get: async (url, body = {}) => {
        return XHR.send('get', url, body)
    },
    post: async (url, body = {}) => {
        return XHR.send('post', url, body)
    },
    patch: async (url, body = {}) => {
        return XHR.send('PATCH', url, body);
    }
}

export default XHR;