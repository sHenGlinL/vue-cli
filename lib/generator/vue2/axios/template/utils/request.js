import axios from 'axios'
// import { Message, MessageBox } from 'element-ui'

const service = axios.create({
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
  }
})

// 请求拦截器
service.interceptors.request.use(config => {
  // config.headers['accessToken'] = 'adacbc02-0576-4d3f-883b-45184b1b500d'
  return config
}, error => {
  Promise.reject(error)
})

// 响应拦截器
service.interceptors.response.use(
  response => {
    if (response.data.code === 500) {
      // Message({
      //   message: response.data.msg,
      //   type: "error",
      //   duration: 3000,
      // });
      return Promise.reject("error");
    } else {
      return response.data
    }
  },
  error => {
    // Message({
    //   message: error.response.data.msg,
    //   type: 'error',
    //   duration: 3000
    // })
    return Promise.reject(error)
  }
)

export default service
