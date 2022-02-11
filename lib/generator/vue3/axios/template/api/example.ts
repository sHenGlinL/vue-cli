/*
 * example
 */
import request from '@/utils/request';
import type { PageModel } from './model/pageModel';

export function exampleFetch(params: PageModel) {
  return request({
    url: '/api/url',
    method: 'get',
    params
  })
}