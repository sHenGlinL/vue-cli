import { InjectionKey } from 'vue';
import { createStore, Store, useStore as baseUseStore } from 'vuex';
import system, { systemType } from './modules/system';

export interface State {
  system: systemType;
}

// 定义 injection key
export const key: InjectionKey<Store<State>> = Symbol();

export const store = createStore<State>({
  modules: {
    system
  }
});

// 定义自己的 `useStore` 组合式函数
export function useStore() {
  return baseUseStore(key);
}
