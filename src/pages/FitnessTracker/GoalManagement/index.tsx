import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Row, Col, Card, Button, Drawer, Form, Input, Select, InputNumber, DatePicker, Popconfirm, message, Progress, Segmented, Space, Typography, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, AimOutlined } from '@ant-design/icons';
import { goalService } from '@/services/FitnessTracker';
import { GoalItem } from '../data';
import moment from 'moment';

const { Text, Title } = Typography;

const GoalManagement: React.FC = () => {
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<GoalItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [form] = Form.useForm();

  const fetchGoals = async () => {
    const data = await goalService.query();
    setGoals(data);
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleAddOrEdit = async (values: any) => {
    const newItem: GoalItem = {
      ...values,
      id: editingItem ? editingItem.id : Math.random().toString(36).substr(2, 9),
      deadline: values.deadline.format('YYYY-MM-DD'),
      currentValue: editingItem ? editingItem.currentValue : (values.currentValue || 0),
    };

    let updatedList;
    if (editingItem) {
      updatedList = goals.map(item => (item.id === editingItem.id ? newItem : item));
    } else {
      updatedList = [...goals, newItem];
    }

    await goalService.save(updatedList);
    setGoals(updatedList);
    setIsDrawerVisible(false);
    form.resetFields();
    setEditingItem(null);
    message.success(editingItem ? 'Cập nhật thành công' : 'Thêm mới thành công');
  };

  const handleUpdateCurrentValue = async (id: string, value: number) => {
    const updatedList = goals.map(item => (item.id === id ? { ...item, currentValue: value } : item));
    await goalService.save(updatedList);
    setGoals(updatedList);
    message.success('Cập nhật tiến độ thành công');
  };

  const handleDelete = async (id: string) => {
    const updatedList = goals.filter(item => item.id !== id);
    await goalService.save(updatedList);
    setGoals(updatedList);
    message.success('Xóa thành công');
  };

  const filteredGoals = goals.filter(g => statusFilter === 'All' || g.status === statusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'blue';
      case 'Achieved': return 'green';
      case 'Cancelled': return 'red';
      default: return 'default';
    }
  };

  return (
    <PageContainer title="Quản lý mục tiêu">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Segmented
              options={['All', 'In Progress', 'Achieved', 'Cancelled']}
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as string)}
            />
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingItem(null);
                form.resetFields();
                setIsDrawerVisible(true);
              }}
            >
              Thêm mục tiêu
            </Button>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {filteredGoals.map(goal => {
            const percent = Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100);
            return (
              <Col xs={24} sm={12} lg={8} key={goal.id}>
                <Card
                  actions={[
                    <EditOutlined key="edit" onClick={() => {
                      setEditingItem(goal);
                      form.setFieldsValue({
                        ...goal,
                        deadline: moment(goal.deadline),
                      });
                      setIsDrawerVisible(true);
                    }} />,
                    <Popconfirm
                      key="delete"
                      title="Xóa mục tiêu này?"
                      onConfirm={() => handleDelete(goal.id)}
                    >
                      <DeleteOutlined style={{ color: 'red' }} />
                    </Popconfirm>
                  ]}
                >
                  <Card.Meta
                    avatar={<AimOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                    title={goal.name}
                    description={
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Tag color={getStatusColor(goal.status)}>{goal.status}</Tag>
                        <Text type="secondary">Loại: {goal.type}</Text>
                        <Text type="secondary">Hạn chót: {moment(goal.deadline).format('DD/MM/YYYY')}</Text>
                        <div style={{ marginTop: 12 }}>
                          <Text>Tiến độ: {goal.currentValue} / {goal.targetValue}</Text>
                          <Progress percent={percent} status={goal.status === 'Achieved' ? 'success' : 'active'} />
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <Text size="small">Cập nhật giá trị hiện tại:</Text>
                          <InputNumber
                            size="small"
                            style={{ width: '100%', marginTop: 4 }}
                            value={goal.currentValue}
                            onChange={(v) => handleUpdateCurrentValue(goal.id, v || 0)}
                          />
                        </div>
                      </Space>
                    }
                  />
                </Card>
              </Col>
            );
          })}
        </Row>
      </Space>

      <Drawer
        title={editingItem ? 'Sửa mục tiêu' : 'Thêm mục tiêu mới'}
        width={400}
        onClose={() => setIsDrawerVisible(false)}
        visible={isDrawerVisible}
        extra={
          <Space>
            <Button onClick={() => setIsDrawerVisible(false)}>Hủy</Button>
            <Button type="primary" onClick={() => form.submit()}>Lưu</Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrEdit}>
          <Form.Item name="name" label="Tên mục tiêu" rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: Giảm 5kg" />
          </Form.Item>
          <Form.Item name="type" label="Loại mục tiêu" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Weight Loss">Giảm cân</Select.Option>
              <Select.Option value="Muscle Gain">Tăng cơ</Select.Option>
              <Select.Option value="Endurance">Cải thiện sức bền</Select.Option>
              <Select.Option value="Other">Khác</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="targetValue" label="Giá trị mục tiêu" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="deadline" label="Hạn chót" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]} initialValue="In Progress">
            <Select>
              <Select.Option value="In Progress">Đang thực hiện</Select.Option>
              <Select.Option value="Achieved">Đã đạt</Select.Option>
              <Select.Option value="Cancelled">Đã hủy</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </PageContainer>
  );
};

export default GoalManagement;
