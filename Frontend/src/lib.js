export const apibaseurl = "http://localhost:8000";
export const imgurl = import.meta.env.BASE_URL;
export function callApi(reqMethod, apiUrl, jsonData, formData, responseHandler, jwtToken = "")
{
    const headers = {};
    if (jsonData) headers["Content-Type"] = "application/json";
    if (jwtToken) headers["Token"] = jwtToken;

    const options = {
        method: reqMethod, 
        headers: headers, 
        body: jsonData ? JSON.stringify(jsonData) : formData ? formData : undefined
    };

    fetch(apiUrl, options)
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.message || `Request failed with status ${res.status}`);
            return data;
        })
        .then((data) => responseHandler(data))
        .catch((err) => responseHandler({code: 500, message: err.message}));
}
