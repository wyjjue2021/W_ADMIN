import React, { Component } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import NumberFilterComponent from './numberFilterComponent';
import NumberFloatingFilterComponent from './numberFloatingFilterComponent';

export default class GridExample extends Component {
  constructor(props) {
    super(props);

    this.state = {
      columnDefs: [
        {
          field: 'athlete',
          filter: 'agTextColumnFilter',
        },
        {
          field: 'gold',
          floatingFilterComponentFramework: (props)=> {console.log(123123);return <NumberFloatingFilterComponent {...props}></NumberFloatingFilterComponent>},
          floatingFilterComponentParams: { suppressFilterButton: true },
          filter: 'customNumberFilter',
        },
        
      ],
      defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        floatingFilter: true,
        resizable: true,
      },
      frameworkComponents: {
        customNumberFloatingFilter: (props)=> {console.log(123123);return <NumberFloatingFilterComponent {...props}></NumberFloatingFilterComponent>},
        customNumberFilter: NumberFilterComponent,
      },
      rowData: null,
    };
  }

  onGridReady = (params) => {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    const updateData = (data) => {
      this.setState({ rowData: data });
    };

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
      .then((resp) => resp.json())
      .then((data) => updateData(data));
  };

  render() {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <div
          id="myGrid"
          style={{
            height: '100%',
            width: '100%',
          }}
          className="ag-theme-alpine"
        >
          <AgGridReact
            columnDefs={this.state.columnDefs}
            defaultColDef={this.state.defaultColDef}
            frameworkComponents={this.state.frameworkComponents}
            rowData={this.state.rowData}
            onGridReady={this.onGridReady}
          />
        </div>
      </div>
    );
  }
}