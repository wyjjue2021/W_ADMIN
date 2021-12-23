import React,{useState, useEffect, useRef, Component} from 'react';
import { useHistory, useLocation } from 'react-router-dom'
import { Layout } from 'antd';
import SiderMenu from '../SiderMenu';
import MainHeader from '../MainHeader';
// import MainFooter from "../MainFooter";
import { getKeyName, isAuthorized } from '@/utils/publicFunc'
import TabPanes from '../TabPanes';
import style from './style.less';

const noNewTab = ['/login'] // 不需要新建 tab的页面
const BasicLayout = ({ route, children }) => {

  const [tabActiveKey, setTabActiveKey] = useState('/home')
  const [panesItem, setPanesItem] = useState({
    title: '',
    content: null,
    key: '',
    closable: false,
    path: ''
  })
  const pathRef = useRef('')

  const history = useHistory()
  const { pathname, search } = useLocation()

  useEffect(() => {
    // setStoreData('SET_COLLAPSED', document.body.clientWidth <= 1366)

    // 未登录
    // if (!token && pathname !== '/login') {
    //   history.replace({ pathname: '/login' })
    //   return
    // }

    const { tabKey, title, component: Content } = getKeyName(pathname)
    // 新tab已存在或不需要新建tab，return
    if (pathname === pathRef.current || noNewTab.includes(pathname)) {
      setTabActiveKey(tabKey)
      return
    }

    // 检查权限，比如直接从地址栏输入的，提示无权限
    const isHasAuth = true  //checkAuth(pathname)
    if (!isHasAuth) {
      const errorUrl = '/403'
      const {
        tabKey: errorKey,
        title: errorTitle,
        component: errorContent
      } = getKeyName(errorUrl)
      setPanesItem({
        title: errorTitle,
        content: errorContent,
        key: errorKey,
        closable: true,
        path: errorUrl
      })
      pathRef.current = errorUrl
      setTabActiveKey(errorKey)
      history.replace(errorUrl)
      return
    }

    // 记录新的路径，用于下次更新比较
    const newPath = search ? pathname + search : pathname
    pathRef.current = newPath
    setPanesItem({
      title,
      content: Content,
      key: tabKey,
      closable: tabKey !== 'welcome',
      path: newPath
    })
    setTabActiveKey(tabKey)
  }, [history, pathname, search])


  return <Layout className={style.mainLayout}>
    <SiderMenu routes={route.childRoutes} />
    {/* 左侧菜单导航 */}
    <Layout className="main-layout-right">
      <MainHeader />
      <TabPanes
          defaultActiveKey="welcome"
          panesItem={panesItem}
          tabActiveKey={tabActiveKey}
        ></TabPanes>      
    </Layout>
  </Layout>
};

export default BasicLayout;
