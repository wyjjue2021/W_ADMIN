import { observable ,action} from 'mobx';
import { indexRouteKey } from '../utils';

export default class TabPanes {
  @observable curTab = [indexRouteKey]
  @observable reloadPath = {}

  @action.bound setCurTab(arr) {
    console.log(arr, 11)
    this.curTab = arr;
  }
}
