// 分页
export interface PageModel {
  current: number;
  total?: number;
  size: -1 | 10 | 20 | 50;
}
