import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Tag } from 'antd';
import { Task, Priority } from '../data.d';
import moment from 'moment';

interface TaskFormProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (values: any) => void;
  initialValues?: Task;
  title: string;
}

const { Option } = Select;
const { TextArea } = Input;

const TaskForm: React.FC<TaskFormProps> = ({ visible, onCancel, onSave, initialValues, title }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue({
        ...initialValues,
        deadline: initialValues.deadline ? moment(initialValues.deadline) : null,
      });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSave({
        ...values,
        deadline: values.deadline ? values.deadline.toISOString() : null,
      });
    } catch (error) {
      console.log('Validate Failed:', error);
    }
  };

  return (
    <Modal
      title={title}
      visible={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Lưu"
      cancelText="Hủy"
      width={600}
    >
      <Form form={form} layout="vertical" initialValues={{ priority: 'Medium' }}>
        <Form.Item
          name="title"
          label="Tên công việc"
          rules={[{ required: true, message: 'Vui lòng nhập tên công việc' }]}
        >
          <Input placeholder="Ví dụ: Hoàn thành thiết kế UI" />
        </Form.Item>

        <Form.Item name="description" label="Mô tả">
          <TextArea rows={4} placeholder="Mô tả chi tiết công việc..." />
        </Form.Item>

        <div style={{ display: 'flex', gap: '16px' }}>
          <Form.Item
            name="deadline"
            label="Deadline"
            rules={[{ required: true, message: 'Vui lòng chọn deadline' }]}
            style={{ flex: 1 }}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Mức độ ưu tiên"
            rules={[{ required: true }]}
            style={{ flex: 1 }}
          >
            <Select>
              <Option value="High">
                <Tag color="red">Cao</Tag>
              </Option>
              <Option value="Medium">
                <Tag color="orange">Trung bình</Tag>
              </Option>
              <Option value="Low">
                <Tag color="blue">Thấp</Tag>
              </Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item name="tags" label="Tags">
          <Select mode="tags" style={{ width: '100%' }} placeholder="Thêm tag (Nhấn Enter để thêm)">
            <Option value="React">React</Option>
            <Option value="Design">Design</Option>
            <Option value="UI/UX">UI/UX</Option>
            <Option value="Backend">Backend</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskForm;
