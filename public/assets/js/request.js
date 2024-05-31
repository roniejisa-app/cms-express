const request = {
    endpoint: '',
    headers: {},
    body: {},
    params: {},
    options: {},
    setHeaders: (key, value) => {
        request.headers[key] = value
    },
    setBody: (key, value) => {
        request.body[key] = value
    },
    buildData: (data, type) => {
        if (type === 'json') {
            return JSON.stringify(data)
        } else if (type === 'formData') {
            const newFormData = new FormData()
            for (const [key, value] of Object.entries(data)) {
                if (value instanceof FileList) {
                    Array.from(value).forEach((file) => {
                        newFormData.append(key, file)
                    })
                } else {
                    newFormData.append(key, value)
                }
            }
            return newFormData
        } else {
            let params = []
            for (const [key, value] of Object.entries(data)) {
                params.push(`${key}=${value}`)
            }
            params = params.join('&')
            return params
        }
    },
    setParam: (key, value) => {
        request.params[key] = value
    },
    send: async (method, url, body = null, type = 'json') => {
        let dataParam = ''
        const options = {
            headers: request.headers,
        }
        if (type === 'json') {
            options.headers['Content-Type'] = 'application/json'
        } else if (type === 'form') {
            options.headers['Content-Type'] =
                'application/x-www-form-urlencoded'
        } else if (type === 'formData') {
            delete options.headers['Content-Type']
        }
        if (body) {
            if (method === 'GET' || type === 'form' || type === 'formData') {
                options['body'] = request.buildData(body, type)
            } else {
                options['body'] = JSON.stringify(body)
            }
        }
        if (Object.entries(request.params).length) {
            dataParam += '?' + request.buildData(request.params)
        }

        options['method'] = method
        try {
            const response = await fetch(
                `${request.getEndpoint()}${url}${dataParam}`,
                options
            )
            const json = await response.json()

            return {
                error: false,
                response,
                data: json,
            }
        } catch (err) {
            return {
                error: {
                    status: 100,
                    message: err.message,
                },
            }
        }
    },
    getEndpoint: () => {
        return request.endpoint
    },
    setEndpoint: (endpoint) => {
        request.endpoint = endpoint
    },
    get: async (url, body = null, type = 'json') => {
        return request.send('GET', url, body, type)
    },
    post: async (url, body, type = 'json') => {
        return request.send('POST', url, body, type)
    },
    patch: async (url, body, type = 'json') => {
        return request.send('PATCH', url, body, type)
    },
}

window.addEventListener('DOMContentLoaded', function () {
    if (document?.querySelector('meta[name="csrf-token"]')) {
        request.setHeaders(
            'X-CSRF-TOKEN',
            document
                .querySelector('meta[name="csrf-token"]')
                .getAttribute('content')
        )
    }
})
export default request
