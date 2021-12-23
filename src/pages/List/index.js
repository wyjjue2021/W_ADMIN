import React, { useEffect, useMemo,useState, memo } from 'react';
import { Table, Button, Switch, Row, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { observer, inject } from 'mobx-react';
import { toJS } from 'mobx';
import TableAgGrid from '../../components/TableAgGrid/indexClass'
import NewModal from './newModal';
import SearchForm from './SearchForm';
import style from  './style.less';
import NumberFloatingFilterComponent from '../../components/TableAgGrid/numberFloatingFilterComponent.js';

const ListPage = (props) => {
  const {listStore} = props;
  const [rowData, setRowData]= useState([])
  const [listCount, setListCount] = useState(0);
  const [totalData, setTotalData]= useState([])
  const [searchForm, setSearchForm]= useState()

  const search = (params) => {
    listStore.qryTableData(params).then((res) => {
      setRowData(res.data);
      setListCount(res.count)
    })
    listStore.qryTotalData().then((data) => {
      setTotalData({operation:1,...data});
    })
  }
  // console.log(listStore);
  // 页面加载获取数据
  useEffect(() => {
    // search()
  }, []);

  const columns = useMemo(
    () => [
      {
        title: '项目名称',
        dataIndex: 'name',
        ellipsis: true,
      },
      {
        title: '标识',
        dataIndex: 'id',
        ellipsis: true,
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: (text, record, index) => (
          <Switch
            checkedChildren="正常"
            unCheckedChildren="停用"
            checked={text}
            loading={record.statusLoading}
            onChange={(type) => listStore.statusChange(type, record, index)}
          />
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'createDate',
        width: 185,
      },
      {
        title: '操作',
        dataIndex: 'operation',
        width: 150,
        render: (text, record) => (
          <Row type="flex" align="middle" className="operation">
            <Button type="link" disabled={record.status} onClick={() => listStore.openModal('edit', record)}>
              编辑
            </Button>
            <Divider type="vertical" />
            <Button
              type="link"
              disabled={record.status}
              onClick={() => listStore.delOne(record.id)}
              loading={listStore.recordLoding}
            >
              删除
            </Button>
          </Row>
        ),
      },
    ],
    [listStore],
  );

  const tableInit = (searchForm) =>{
    setSearchForm(searchForm)
  }

  

  return (
    <div className={style.pageForm}>
      <div className="list-box">
        {searchForm}
        <div className="list-table">
          <TableAgGrid
            search = {search}
            gridName={'仓储出库订单表'}
            pageSize={10}
            enableServerSideSorting={true}
            rowData={rowData}
            rowCount={listCount}
            initTable={tableInit}
            // cellRenderer={{
            //   key: this.keyRender,
            //   operation: this.operationCellRender,
            // }}
            // selectFilter={{
            //   unloadType: unloadList_type,
            //   status: unloadOrder_status,
            // }}
            rowSelection={'multiple'}
            // totalData= {totalData}
            hasSelectTotal= { true }
            // 合计需要的cellrender
            pinnedCellRenderer={{
              key: () => null,
              operation: (props) => <span>{props.value}</span>,
            }}
            onSelectionChanged={() => {}}
            hideFilter="false"
            floatingFilterComponentFramework={
              {
                clientCode: NumberFloatingFilterComponent
              }
            }
          >
          </TableAgGrid>
          
        </div>
      </div>
      <NewModal />
    </div>
  );
};

export default memo(inject('listStore')(observer(ListPage)));
