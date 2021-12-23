/*
 * @Description:
 * @Author: wjunj
 * @Date: 2020-12-09 18:36:39
 * @LastEditors: wjunj
 * @LastEditTime: 2020-12-10 17:34:53
 * @FilePath: /react-web-pro/src/pages/Home/store.js
 */
import { createContext } from 'react';
import { observable, action } from 'mobx';
import request from '@/services/newRequest';

export default class HomeStore {
  @observable tableData = [];

  @observable pageTitle = 'Home主页';

  @observable loading = false;

  @action.bound setData(data = {}) {
    Object.entries(data).forEach((item) => {
      this[item[0]] = item[1];
    });
  }

  // 列表数据
  @action.bound
  async qryTableDate(page = 1, size = 10) {
    this.loading = true;
    const res = await request({
      url: '/list',
      method: 'post',
      data: { page, size },
    });

    if (res.success) {
      const resData = res.data || {};
      console.log(resData);
    }
    this.loading = false;
  }
}
