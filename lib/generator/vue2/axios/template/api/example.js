/*
 * example
 */
import request from '@/utils/request';

export function exampleFetch(params) {
  return request({
    url: '/api/url',
    method: 'get',
    params
  })
}