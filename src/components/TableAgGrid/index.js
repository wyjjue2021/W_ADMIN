import React, { useState, useCallback, useEffect, memo, useMemo, useLayoutEffect, Component } from 'react';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import request from '@/services/newRequest';
import { Input, Select, Popover, Icon, Checkbox } from 'antd';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import style from './index.less'
import {debounce} from 'lodash'
import BigNumber from 'bignumber.js';

let getHeaderUrl = '/dataform/queryForm.do'
let saveHeaderUrl = '/dataform/saveForm.do'

const _pageSizeOption = [10, 20, 50, 100, 200];
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;

const TableAgGrid = (props) => {
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const { gridName, columns, rowSpan, rowSpanField, totalData = undefined, search,
        pinnedTopRowData, onSelectionChanged, rowSelection, rowCount, rowData = [],
        cellRenderer, pinnedCellRenderer, pinnedColumns, headerRenderer, pageSize, pageSizeOption,
        hideTableHeaderControl = false, floatingFilterComponentFramework = {}, defaultColDef = {},
        hasSelectTotal, selectTotalFiledName,textColFieldName = 'operation'} = props
    const [tableColumns, setTableColumns] = useState([])
    const [activePage, setActivePage] = useState(1);
    const [_pageSize, set_pageSize] = useState(pageSize)
    const [tableHeaderControlList, setTableHeaderControlList] = useState([]);
    const [sortByName, setSortByName] = useState(null);
    const [sortByType, setSortByType] = useState(null);
    const [agGridRender, setAGridRender] = useState(null);
    const [pinnedBottomRowData, setPinnedBottomRowData] = useState([]);
    
    let cellArr = Object.keys(cellRenderer || []);                        //
    let pinnedCellArr = Object.keys(pinnedCellRenderer || []);            //
    let _pinnedColumns = ['operation', 'key'].concat(pinnedColumns || []); //
    let headerArr = Object.keys(headerRenderer || {});                    //
    let _pageNum = Math.ceil(rowCount / pageSize)

    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
    };

    const _search = ({
        pageNo = activePage, 
        pageSize = _pageSize,
        orderBy = sortByName,
        orderByType = sortByType
    }) => {
        Object.prototype.toString.call(search) === '[object Function]' && search({
            pageNo,
            pageSize,
            orderBy,
            orderByType
        })        
    }


    const setColumn = () => {
        setTimeout(() => {
            if (!gridName || !gridColumnApi) {
                return;
            }

            let columns = gridColumnApi && gridColumnApi.getAllGridColumns();
            let selectionIndex = columns.findIndex(item => item.colId === '0');
            let actionIndex = columns.findIndex(item => item.colId === '1');
            let bizColumns = [];
            columns.forEach(function (currentValue, index) {
                if (selectionIndex !== index && actionIndex !== index) {
                    bizColumns.push(currentValue);
                }
            });

            let sortByName = '';
            let sortByType = '';
            let resizeColumn = bizColumns.map((col, index) => {
                let visibleFlag = !col.visible ? '0' : '1';
                let searchFlag = col.colDef.suppressFilter ? '0' : '1';
                let orderbyType = 0;
                switch(col.sort){
                    case 'asc':
                        orderbyType = 1
                        break
                    case 'desc':
                        orderbyType = 2
                        break;
                    default:
                        break
                }
                
                if (orderbyType) {
                    sortByName = col.colDef.orderbyName || col.colDef.fieldName;
                    sortByType = col.sort;
                }
                return {
                    gridName,
                    fieldName: col.colId,
                    fieldCaption: col.colDef.headerName,
                    width: col.actualWidth,
                    visibleFlag: visibleFlag,
                    displayOrder: index,
                    searchFlag: searchFlag,
                    orderbyName: col.colDef.orderbyName || col.colDef.fieldName,
                    orderbyType,
                };
            });
            setTableColumns(resizeColumn)
            setSortByName(sortByName)
            setSortByType(sortByType)
            
            
            resizeColumn.length && request({
                url: saveHeaderUrl,
                method: 'post',
                ifHandleError: false,
                data: {
                    list: resizeColumn
                },
            });
        }, 100);
    }

    const onTableHeaderControlCheck = function (checkedValues) {
        let newColumn = []
        newColumn = tableColumns.map(item => {
            return {
                ...item,
                visibleFlag: String(Number(checkedValues.includes(item.fieldName)))

            }
        })
        setTableColumns(newColumn)
        setColumn(true)
    }

    const formatTableHeaderControl = (columns) => {
        columns.sort(function (a, b) {
            if (a.displayOrder > b.displayOrder) {
                return 1;
            }
            if (a.displayOrder < b.displayOrder) {
                return -1;
            }
            return 0;
        });
        let options = columns.map(option => ({
            label: `${option.fieldCaption.split('~')[0]}`,
            value: `${option.fieldName}`,
        }));
        let hidedColumn = [];
        columns.forEach(col => {
            if (col.visibleFlag === '1') {
                hidedColumn.push(col.fieldName);
            }
        });
        return (
            <CheckboxGroup
                options={options}
                defaultValue={hidedColumn}
                onChange={onTableHeaderControlCheck}
            />
        );
    }

    const getAgGridColumnProps = (col) => {
        const sortDesc = col.orderbyType === 2 ? 'desc' : '';

        let __column = {
            key: col.fieldName,
            headerName: col.fieldCaption.split('~')[0] || '',          // 兼容品字形表头，会员接口不支持新增字段，只能放在此字段用 ~ 分隔
            field: col.fieldName, // 
            width: Number(col.width) || '',
            // suppressMenu = {true}                                           
            tooltipField: col.fieldName || col.fieldCaption || '',
            hide: col.visibleFlag === '0',                               // 是否隐藏列
            suppressFilter: col.searchFlag === '0',
            pinned: _pinnedColumns.includes(col.fieldName),
            suppressMovable: _pinnedColumns.includes(col.fieldName),      // 是否可一栋
            suppressSorting: !col.orderbyName,                           // 是否可排序
            orderByName: col.orderbyName || col.fieldName,                                // 后端返回排序字段名称
            sort: col.orderbyType === 1 ? 'asc' : sortDesc,              // 默认排序字段
            filterParams: {                                               //要传递给子过滤器组件的自定义参数。
                textFormatter: function (r) {
                    // 处理大写字母转小写问题
                    return r;
                }
            },
            // floatingFilterComponentParams : { suppressFilterButton: true },
            floatingFilterComponentFramework:                           // 用于子过滤器的浮动框架过滤器组件
                Object.prototype.toString.call(floatingFilterComponentFramework) === '[object Object]' 
                    ? floatingFilterComponentFramework[col.fieldName] || null : null,                 
            cellRendererFramework:                                        // 单元格自定义模板
                cellArr.indexOf(col.fieldName) >= 0 ? cellRenderer[col.fieldName] : null,
            headerComponentFramework:                                     // 表头自定义模板  
                headerArr.indexOf(col.fieldName) >= 0 ? headerRenderer[col.fieldName] : null,
            pinnedRowCellRendererFramework:
                pinnedCellArr.indexOf(col.fieldName) >= 0
                    ? pinnedCellRenderer[col.fieldName]
                    : null,
            rowSpan:
                params => {
                    if (
                        rowSpan &&
                        rowSpanField &&
                        col.fieldName === rowSpanField
                    ) {
                        return (params.data && params.data[rowSpan]) || 1; // 行合并数
                    } else {
                        return 1;
                    }
                },
            cellStyle: params =>
                params.colDef.rowSpan(params) > 1 ? { backgroundColor: '#fff' } : null
        }

        // // 判断是否有品字形的表头，取出表头名。会员接口不支持新增新字段，只能用 ~ 找出品字头部名称
        // let parent = col.fieldCaption.split('~').length > 1 && col.fieldCaption.split('~')[1];
        // // 判断是否有
        // if (parent) {
        //   column.headerClass = 'header-group_children';
        //   // 末尾项
        //   let lastColumn = newColumn[newColumn.length - 1] || null;
        //   // 判断末尾项是否有chilren 其 名称是否相同，不同则新开一线
        //   if (lastColumn && lastColumn.children && lastColumn.headerName === parent) {
        //     lastColumn.children.push(column);
        //   } else {
        //     let newCol;
        //     newCol = {
        //       headerName: parent,
        //       children: [column],
        //       groupId: parent,
        //       marryChildren: true,
        //     };
        //     newColumn.push(newCol);
        //   }
        // } else {
        //   // col.children && col.children.length && (column.children = col.children)
        //   newColumn.push(column);
        // }
        return {
            ...__column
        }
    }

    const checkboxSelectionColumn = (params) => {
        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;
        return thisIsFirstColumn;
    }


    const _onSelectionChanged = (event) => {
        let api = event.api
        let selectNodes = api.getSelectedNodes()
        let data = selectNodes.map(item => item.data)
        hasSelectTotal && pinnedBottomRowDataFormart()
        typeof onSelectionChanged === 'function' && onSelectionChanged && onSelectionChanged(data, api.getSelectedNodes(), api)
    };


    const _onPaginationChanged = () => {
        console.log('onPaginationPageLoaded');
        if (gridApi) {
            //   setText('#lbLastPageFound', gridApi.paginationIsLastPageFound());
            //   setText('#lbPageSize', gridApi.paginationGetPageSize());
            //   setText('#lbCurrentPage', gridApi.paginationGetCurrentPage() + 1);
            //   setText('#lbTotalPages', gridApi.paginationGetTotalPages());
            //   setLastButtonDisabled(!gridApi.paginationIsLastPageFound());
        }
    };

    const _pageSizeChange = (val) => {
        set_pageSize(val)
        setActivePage(1)
        gridApi.paginationGoToPage(1)
        _search({
            pageNo: 1,
            pageSize: val
        })
    }

    const initPagination = () => {
        let len = 8 / 2
        let min = Math.abs(activePage - len)
        let max = Math.abs(activePage + len)

        let resArr = Array.apply(null, Array(_pageNum)).map(function (item, i) {
            return i + 1
        })
        resArr = resArr.filter((item, index) => {
            let res = false

            switch (true) {
                case activePage <= len:
                    res = index < min + max;
                    break;
                case activePage > len && activePage < _pageNum - len:
                    res = index >= min && index < max
                    break;
                case activePage >= _pageNum - len:
                    res = index >= _pageNum - 8
                    break;
                default:
                    break;
            }
            return res
        })
            .map(i => <span
                className={i === activePage ? 'pageNav active' : 'pageNav'}
                onClick={() => {
                    pageActive(i)
                }}
                key={`page-${i}`}
            >
                {i}
            </span>)
        return resArr
    }

    const pageGoto = () => {
        let page = parseInt(e.target.value, 10) || -1;
        page = page > _pageNum ? _pageNum : page;
        page = page > 0 ? page : 0;
        setActivePage(page)
        gridApi.paginationGoToPage(page);
        _search({
            pageNo: page,
        })
    }

    const pageNext = () => {
        let next = activePage + 1 < _pageNum ? activePage + 1 : _pageNum
        setActivePage(next)
        gridApi.paginationGoToPage(next);
        _search({
            pageNo: next,
        })
    }

    const pagePrev = () => {
        let prev = activePage - 1 > 0 ? activePage - 1 : 0
        setActivePage(prev)
        gridApi.paginationGoToPage(prev);
        _search({
            pageNo: prev,
        })
    }

    const pageActive = (index) => {
        setActivePage(index)
        gridApi.paginationGoToPage(index);
        _search({
            pageNo: index,
        })
    }

    useEffect(async () => {
        if (gridName) {
            let res = await request({
                url: getHeaderUrl,
                method: 'post',
                ifHandleError: false,
                data: {
                    gridName,
                },
            });

            if (res.code === 0) {
                setTableColumns(res.data)
                let _sortByName;
                let _sortByType;
                res.data.forEach(col => {
                    // 设置排序字段
                    if (col.orderbyType === 1 || col.orderbyType === 2) {

                        _sortByName = col.orderbyName || col.fieldName
                        _sortByType = col.orderbyType === 1 ? 'asc' : 'desc'
                        setSortByName(_sortByName)
                        setSortByType(_sortByType)
                    }
                })
                _search({
                    orderBy: _sortByName,
                    orderByType: _sortByType
                })
            }
        } else {

        }
    }, [])

    /**
     * @export选中合计
     * @param {any} data：选中的数组
     * @param {any} arr：需要合计的字段合集
     * @param {any} lenStr：统计单数的字段
     * @param {any} strF：统计单数的字段拼接前面
     * @param {any} strB：统计单数的字段拼接后面
     * @returns
     */
     const sumSelectedTb = (data, arr, lenStr, strF, strB) => {
        let selectJson = {};
        arr.forEach(v => {
            let column = (data || []).map(ele => parseFloat(ele[v] || 0));
            selectJson[v] = column.reduce(function(sum, value) {
            return new BigNumber(sum).plus(value).valueOf();
            }, 0);
        });
        selectJson[lenStr] = `${strF}${data.length}${strB}`;
        return {
            ...selectJson,
            sumSelected: true,
        };
    };

    const pinnedBottomRowDataFormart = (data = undefined) => {
        if(hasSelectTotal){
            setTimeout(() => {
                    if(!gridApi) {
                        return
                    }
                    let selectNodes = gridApi.getSelectedNodes()
                    let selectedRows = selectNodes.map(item => item.data)
                    const sumSelectJson = sumSelectedTb(
                        data || selectedRows,
                        selectTotalFiledName || Object.keys(totalData),
                        textColFieldName,
                        '选中合计：',
                        '单',
                    );
                    gridApi.setPinnedBottomRowData([
                        sumSelectJson,
                        totalData
                    ])
                
            }, 100);
        }else {
            return totalData ? [totalData] : null
        }
    }
   
    const renderAgGrid = () => {
        return <AgGridReact
            className="agGridReact"
            rowData={rowData}
            onGridReady={onGridReady}
            defaultColDef={{
                sortable: true,
                resizable: true,
                headerCheckboxSelection: rowSelection ? checkboxSelectionColumn : null,
                checkboxSelection: rowSelection ? checkboxSelectionColumn : null,
                floatingFilter: !!Object.keys(floatingFilterComponentFramework).length,
                ...defaultColDef
            }}
            pinnedTopRowData={pinnedTopRowData}
            pinnedBottomRowData={pinnedBottomRowDataFormart()}
            rowSelection={rowSelection}
            onSelectionChanged={_onSelectionChanged}
            paginationPageSize={_pageSize}
            pagination={true}
            suppressPaginationPanel={true}
            onPaginationChanged={_onPaginationChanged}
            onDragStopped={setColumn}
            onSortChanged={setColumn}

        >
            {
                tableColumns.map(item => {
                    let _props = getAgGridColumnProps(item) || {}
                    return <AgGridColumn {..._props}></AgGridColumn>
                })
            }
        </AgGridReact>

    }

    useMemo(() => {
        setTableHeaderControlList(formatTableHeaderControl(tableColumns))
        setAGridRender(renderAgGrid())
    }, [tableColumns, rowData, totalData, pinnedTopRowData, pinnedBottomRowData])


    return (
        <div className={`${style.tableAgGrid} ag-theme-alpine`} style={{ paddingTop: !hideTableHeaderControl ? '38px' : 0 }}>
            {!hideTableHeaderControl && <div
                className="icon-filter_box"
            >
                <Popover
                    content={tableHeaderControlList}
                    overlayStyle={{ width: '160px' }}
                    overlayClassName="ag-filter"
                    placement="bottomRight"
                    title="列表设置"
                >
                    <i style={{ fontSize: 18, position: 'relative', color: 'rgba(145,145,145,1)' }}>
                        <svg viewBox="64 64 896 896" focusable="false" data-icon="filter" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M880.1 154H143.9c-24.5 0-39.8 26.7-27.5 48L349 597.4V838c0 17.7 14.2 32 31.8 32h262.4c17.6 0 31.8-14.3 31.8-32V597.4L907.7 202c12.2-21.3-3.1-48-27.6-48zM603.4 798H420.6V642h182.9v156zm9.6-236.6l-9.5 16.6h-183l-9.5-16.6L212.7 226h598.6L613 561.4z"></path></svg>
                    </i>
                </Popover>
            </div>
            }
            { agGridRender }
            <div className="pagination">
                <span className="pageCount">共 {rowCount || ''} 条</span>
                <span
                    className="pageNav"
                    onClick={pagePrev}
                >
                    &lt;
                </span>
                {initPagination()}
                <span
                    className="pageNav"
                    onClick={pageNext}
                >
                    &gt;
                </span>
                <span className="pageGoto">
                    跳至第
                    <Input
                        type="text"
                        className="pageGotoNum"
                        maxLength={4}
                        onPressEnter={pageGoto}
                    />
                    页
                </span>
                <Select
                    className="pageSize"
                    value={_pageSize}
                    onChange={_pageSizeChange}
                >
                    {(pageSizeOption || _pageSizeOption).map(val => (
                        <Option key={val} value={val}>{val}条/页</Option>
                    ))}
                </Select>
            </div>
        </div>
    );
};

export default memo(TableAgGrid);
