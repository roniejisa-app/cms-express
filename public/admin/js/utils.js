const request = {
  endpoint: "",
  headers: {},
  body: {},
  params: {},
  options: {},
  setHeaders: (key, value) => {
    request.headers[key] = value;
  },
  setBody: (key, value) => {
    request.body[key] = value;
  },
  buildData: (data, type) => {
    if (type === "json") {
      return JSON.stringify(data);
    } else if (type === "formData") {
      const newFormData = new FormData();
      for (const [key, value] of Object.entries(data)) {
        if (value instanceof FileList) {
          Array.from(value).forEach((file) => {
            newFormData.append(key, file);
          });
        } else {
          newFormData.append(key, value);
        }
      }
      return newFormData;
    } else {
      var params = [];
      for (const [key, value] of Object.entries(data)) {
        params.push(`${key}=${value}`);
      }
      params = params.join("&");
      return params;
    }
  },
  setParam: (key, value) => {
    request.params[key] = value;
  },
  send: async (method, url, body = null, type = "json") => {
    let dataParam = "";
    const options = {
      headers: request.headers
    };
    if (type === "json") {
      options.headers["Content-Type"] = "application/json";
    } else if (type === "form") {
      options.headers["Content-Type"] = "application/x-www-form-urlencoded";
    } else if (type === "formData") {
      delete options.headers["Content-Type"];
    }
    if (body) {
      if (method === "GET" || type === "form" || type === "formData") {
        options["body"] = request.buildData(body, type);
      } else {
        options["body"] = JSON.stringify(body);
      }
    }
    if (Object.entries(request.params).length) {
      dataParam += "?" + request.buildData(request.params);
    }
    options["method"] = method;
    try {
      const response = await fetch(`${request.getEndpoint()}${url}${dataParam}`, options);
      const json = await response.json();
      return {
        error: false,
        status: "OK",
        data: json
      };
    } catch (err) {
      return {
        error: true,
        message: err
      };
    }
  },
  getEndpoint: () => {
    return request.endpoint;
  },
  setEndpoint: (endpoint) => {
    request.endpoint = endpoint;
  },
  get: async (url, body = null, type = "json") => {
    return await request.send("GET", url, body, type);
  },
  post: async (url, body, type = "json") => {
    return await request.send("POST", url, body, type);
  }
};
const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes)
    return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};
const getBase64 = (file) => {
  return new Promise((resolve) => {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function() {
      resolve(reader.result);
    };
    reader.onerror = function(error) {
      resolve(error);
    };
  });
};
const eD = (data) => {
  let randomString = Math.random().toString(36).toString(36).substring(2) + (/* @__PURE__ */ new Date()).getTime().toString(36).substring(2);
  let startString = randomString.slice(3, 8);
  let endString = randomString.slice(9, 15);
  data = btoa(btoa(endString + btoa(startString + btoa(encodeURIComponent(JSON.stringify(data))) + endString).split("").reverse().join("-") + startString).split("").reverse().join("?"));
  return data;
};
const dD = (base64Data) => {
  let firstDecode = atob(atob(base64Data).split("?").reverse().join(""));
  let secondDecode = atob(firstDecode.slice(6, -5).split("-").reverse().join(""));
  let threeDecode = atob(secondDecode.slice(5, -6));
  let data = JSON.parse(decodeURIComponent(threeDecode));
  return data;
};
export {
  dD as d,
  eD as e,
  formatBytes as f,
  getBase64 as g,
  request as r
};
