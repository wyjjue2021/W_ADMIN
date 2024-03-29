import React, { useState, useEffect, useContext } from 'react';
import { observer, inject } from 'mobx-react';
import { Button } from 'antd';

import './style.less';

const HomePage = (props) => {
  console.log(props, 1)
  // useContext 订阅mobx数据
  const pageStore  = props.homeStore;
  // useState state状态
  const [num, setNum] = useState(0);
  // useEffect副作用
  useEffect(() => {
    pageStore.qryTableDate();
  }, []);

  return (
    <div className="page-home page-content">
      <h2>{pageStore.pageTitle}</h2>
      <div>
        <span>num值：{num}</span>
        <Button type="primary" size="small" style={{ marginLeft: 10 }} onClick={() => setNum(num + 1)}>
          +1
        </Button>
      </div>
    </div>
  );
};

export default inject('homeStore')(observer(HomePage));
