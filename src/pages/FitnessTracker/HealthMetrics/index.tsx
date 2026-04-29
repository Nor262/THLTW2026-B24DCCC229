import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { Button, Modal, Form, InputNumber, DatePicker, Popconfirm, message, Tag, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { healthMetricService } from '@/services/FitnessTracker';
import { HealthMetricItem } from '../data';
import moment from 'moment';
import { useRef } from 'react';

const HealthMetrics: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [metrics, setMetrics] = useState<HealthMetricItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<HealthMetricItem | null>(null);
  const [form] = Form.useForm();

  const fetchMetrics = async () => {
    const data = await healthMetricService.query();
    setMetrics(data);
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const calculateBMI = (weight: number, heightCm: number) => {
    if (!weight || !heightCm) return 0;
    const heightM = heightCm / 100;
    return parseFloat((weight / (heightM * heightM)).toFixed(1));
  };

  const getBMITag = (bmi: number) => {
    if (bmi < 18.5) return <Tag color="blue">Thiếu cân</Tag>;
    if (bmi >= 18.5 && bmi < 25) return <Tag color="green">Bình thường</Tag>;
    if (bmi >= 25 && bmi < 30) return <Tag color="warning">Thừa cân</Tag>;
    return <Tag color="error">Béo phì</Tag>;
  };

  const handleAddOrEdit = async (values: any) => {
    const bmi = calculateBMI(values.weight, values.height);
    const newItem: HealthMetricItem = {
      ...values,
      id: editingItem ? editingItem.id : Math.random().toString(36).substr(2, 9),
      date: values.date.format('YYYY-MM-DD'),
      bmi,
    };

    let updatedList;
    if (editingItem) {
      updatedList = metrics.map(item => (item.id === editingItem.id ? newItem : item));
    } else {
      updatedList = [...metrics, newItem];
    }

    await healthMetricService.save(updatedList);
    setMetrics(updatedList);
    setIsModalVisible(false);
    form.resetFields();
    setEditingItem(null);
    actionRef.current?.reload();
    message.success(editingItem ? 'Cập nhật thành công' : 'Thêm mới thành công');
  };

  const handleDelete = async (id: string) => {
    const updatedList = metrics.filter(item => item.id !== id);
    await healthMetricService.save(updatedList);
    setMetrics(updatedList);
    actionRef.current?.reload();
    message.success('Xóa thành công');
  };

  const columns: ProColumns<HealthMetricItem>[] = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      valueType: 'date',
      sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
    },
    {
      title: 'Cân nặng (kg)',
      dataIndex: 'weight',
      valueType: 'digit',
    },
    {
      title: 'Chiều cao (cm)',
      dataIndex: 'height',
      valueType: 'digit',
    },
    {
      title: 'BMI',
      dataIndex: 'bmi',
      search: false,
      render: (_, record) => (
        <Space>
          <span>{record.bmi}</span>
          {getBMITag(record.bmi)}
        </Space>
      ),
    },
    {
      title: 'Nhịp tim (bpm)',
      dataIndex: 'restingHeartRate',
      search: false,
    },
    {
      title: 'Giờ ngủ',
      dataIndex: 'sleepHours',
      search: false,
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
    const data = await healthMetricService.query();
    let filtered = [...data];

    if (params.date) {
      filtered = filtered.filter(item => item.date === params.date);
    }
    if (params.weight) {
      filtered = filtered.filter(item => item.weight === params.weight);
    }
    if (params.height) {
      filtered = filtered.filter(item => item.height === params.height);
    }

    return {
      data: filtered,
      success: true,
    };
  };

  return (
    <PageContainer title="Nhật ký chỉ số sức khỏe">
      <ProTable<HealthMetricItem>
        headerTitle="Danh sách chỉ số"
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
            Thêm chỉ số
          </Button>,
        ]}
        request={handleRequest}
        columns={columns}
      />

      <Modal
        title={editingItem ? 'Sửa chỉ số' : 'Thêm chỉ số mới'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrEdit}>
          <Form.Item name="date" label="Ngày ghi nhận" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="weight" label="Cân nặng (kg)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} step={0.1} />
          </Form.Item>
          <Form.Item name="height" label="Chiều cao (cm)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="restingHeartRate" label="Nhịp tim lúc nghỉ (bpm)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={30} />
          </Form.Item>
          <Form.Item name="sleepHours" label="Giờ ngủ" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} max={24} step={0.5} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default HealthMetrics;
