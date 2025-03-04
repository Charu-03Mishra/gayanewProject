import axios from "axios";

export const BACKEND_URL = `${process.env.NEXT_PUBLIC_PUBLIC_URL}`;

const api = async (pathname, method, body, formData=false, includeCredentials = false) => {
    const axiosConfig = {
        url: `${process.env.NEXT_PUBLIC_PUBLIC_URL}/api/${pathname}`,
        method: method,
    };
    if(body){
        if(formData){
          console.log("body------", body);
            const data = new FormData();
            for (const key in body) {
              if (body.hasOwnProperty(key)) {
                  data.append(key, body[key]);
              }
            }
            console.log('data', data);
            axiosConfig.data = data;
        }else{
            axiosConfig.data = body;
        }
    }
    if (includeCredentials) {
      const token = localStorage.getItem("user-token");
      console.log(token);
        axiosConfig.headers = {
            'Authorization': `Token ${token}`
        };
    }
    console.log("axiosConfig", axiosConfig);

    return await axios(axiosConfig)
        .then((res) => res)
        .catch((e) => {
            console.log('inside: ', e);
            return e;
        });
};

export default api;