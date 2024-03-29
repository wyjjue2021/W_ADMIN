import React from 'react';
import { observer, inject } from 'mobx-react';
import { Form, Input, Select, Modal } from 'antd';
import { toJS } from 'mobx';

const status = [
  { key: true, label: '正常' },
  { key: false, label: '停用' },
];

const myModal = (props) => {
  const {listStore} = props;
  const modalData = toJS(listStore.modalData);
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      listStore.addNew(values);
    });
  };

  return (
    <Modal
      title={listStore.modalTitle}
      visible={listStore.newModalVisible}
      onOk={handleSubmit}
      onCancel={() => listStore.setData({ newModalVisible: false })}
      okButtonProps={{ loading: listStore.newLoading }}
    >
      <Form labelCol={{ span: 6 }} wrapperCol={{ span: 12 }} form={form}>
        <Form.Item
          label="项目名称"
          name="name"
          initialValue={modalData.name}
          rules={[{ required: true, whitespace: true, message: '请输入项目名称' }]}
        >
          <Input placeholder="请输入项目名称" maxLength={64} />
        </Form.Item>
        <Form.Item
          label="标识"
          name="id"
          initialValue={modalData.id}
          rules={[
            { required: true, whitespace: true, message: '请输入标识' },
            { pattern: /^[A-Za-z0-9_]+$/, message: '请输入字母、数字、下划线组合' },
          ]}
        >
          <Input placeholder="请输入标识" maxLength={64} disabled={listStore.modalType !== 'new'} />
        </Form.Item>
        <Form.Item
          label="状态"
          name="status"
          initialValue={modalData.status !== undefined ? modalData.status : true}
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Select placeholder="请选择状态">
            {status.map((item) => (
              <Select.Option value={item.key} key={item.key}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default inject('listStore')(observer(myModal));
