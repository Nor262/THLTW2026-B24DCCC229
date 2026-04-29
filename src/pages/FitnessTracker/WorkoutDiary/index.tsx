import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { Button, Modal, Form, Input, Select, InputNumber, DatePicker, Popconfirm, message, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { workoutService } from '@/services/FitnessTracker';
import { WorkoutItem } from '../data';
import moment from 'moment';
import { useRef } from 'react';

const WorkoutDiary: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkoutItem | null>(null);
  const [form] = Form.useForm();

  const fetchWorkouts = async () => {
    const data = await workoutService.query();
    setWorkouts(data);
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleAddOrEdit = async (values: any) => {
    const newItem: WorkoutItem = {
      ...values,
      id: editingItem ? editingItem.id : Math.random().toString(36).substr(2, 9),
      date: values.date.format('YYYY-MM-DD'),
    };

    let updatedList;
    if (editingItem) {
      updatedList = workouts.map(item => (item.id === editingItem.id ? newItem : item));
    } else {
      updatedList = [...workouts, newItem];
    }

    await workoutService.save(updatedList);
    setWorkouts(updatedList);
    setIsModalVisible(false);
    form.resetFields();
    setEditingItem(null);
    actionRef.current?.reload();
    message.success(editingItem ? 'Cập nhật thành công' : 'Thêm mới thành công');
  };

  const handleDelete = async (id: string) => {
    const updatedList = workouts.filter(item => item.id !== id);
    await workoutService.save(updatedList);
    setWorkouts(updatedList);
    actionRef.current?.reload();
    message.success('Xóa thành công');
  };

  const columns: ProColumns<WorkoutItem>[] = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      valueType: 'dateRange',
      sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
      search: {
        transform: (value) => ({ startTime: value[0], endTime: value[1] }),
      },
      render: (_, record) => record.date,
    },
    {
      title: 'Tên bài tập',
      dataIndex: 'name',
      copyable: true,
      ellipsis: true,
      formItemProps: {
        rules: [{ required: true, message: 'Vui lòng nhập tên bài tập' }],
      },
    },
    {
      title: 'Loại bài tập',
      dataIndex: 'type',
      valueType: 'select',
      valueEnum: {
        Cardio: { text: 'Cardio' },
        Strength: { text: 'Strength' },
        Yoga: { text: 'Yoga' },
        HIIT: { text: 'HIIT' },
        Other: { text: 'Other' },
      },
    },
    {
      title: 'Thời lượng (phút)',
      dataIndex: 'duration',
      valueType: 'digit',
      search: false,
    },
    {
      title: 'Calo đốt',
      dataIndex: 'calories',
      valueType: 'digit',
      search: false,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        Completed: { text: 'Hoàn thành', status: 'Success' },
        Missed: { text: 'Bỏ lỡ', status: 'Error' },
      },
      render: (_, record) => (
        <Tag color={record.status === 'Completed' ? 'green' : 'red'}>
          {record.status === 'Completed' ? 'Hoàn thành' : 'Bỏ lỡ'}
        </Tag>
      ),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      search: false,
      ellipsis: true,
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      render: (_, record) => [
        <Button
          key="edit"
          type="link"
          icon={<EditOutlined />}
          onClick={() => {
            setEditingItem(record);
            form.setFieldsValue({
              ...record,
              date: moment(record.date),
            });
            setIsModalVisible(true);
          }}
        >
          Sửa
        </Button>,
        <Popconfirm
          key="delete"
          title="Bạn có chắc chắn muốn xóa?"
          onConfirm={() => handleDelete(record.id)}
          okText="Có"
          cancelText="Không"
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            Xóa
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  const handleRequest = async (params: any) => {
    const data = await workoutService.query();
    let filtered = [...data];

    if (params.name) {
      filtered = filtered.filter(item => item.name.toLowerCase().includes(params.name.toLowerCase()));
    }
    if (params.type) {
      filtered = filtered.filter(item => item.type === params.type);
    }
    if (params.date) {
      const [start, end] = params.date;
      filtered = filtered.filter(item => moment(item.date).isBetween(moment(start), moment(end), 'day', '[]'));
    }

    return {
      data: filtered,
      success: true,
    };
  };

  return (
    <PageContainer title="Nhật ký tập luyện">
      <ProTable<WorkoutItem>
        headerTitle="Danh sách các buổi tập"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => {
              setEditingItem(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Thêm buổi tập
          </Button>,
        ]}
        request={handleRequest}
        columns={columns}
      />

      <Modal
        title={editingItem ? 'Sửa buổi tập' : 'Thêm buổi tập mới'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrEdit}>
          <Form.Item name="date" label="Ngày tập" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="name" label="Tên bài tập" rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: Chạy bộ buổi sáng" />
          </Form.Item>
          <Form.Item name="type" label="Loại bài tập" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Cardio">Cardio</Select.Option>
              <Select.Option value="Strength">Strength</Select.Option>
              <Select.Option value="Yoga">Yoga</Select.Option>
              <Select.Option value="HIIT">HIIT</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="duration" label="Thời lượng (phút)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="calories" label="Calo đốt" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Completed">Hoàn thành</Select.Option>
              <Select.Option value="Missed">Bỏ lỡ</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default WorkoutDiary;
