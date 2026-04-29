import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Row, Col, Card, Input, Select, Tag, Button, Modal, Form, InputNumber, Space, Typography, Popconfirm, message } from 'antd';
import { PlusOutlined, SearchOutlined, FilterOutlined, InfoCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { exerciseService } from '@/services/FitnessTracker';
import { ExerciseItem } from '../data';

const { Text, Title, Paragraph } = Typography;

const ExerciseLibrary: React.FC = () => {
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<string>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ExerciseItem | null>(null);
  const [form] = Form.useForm();

  const fetchExercises = async () => {
    const data = await exerciseService.query();
    setExercises(data);
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const handleAddOrEdit = async (values: any) => {
    const newItem: ExerciseItem = {
      ...values,
      id: editingItem ? editingItem.id : Math.random().toString(36).substr(2, 9),
    };

    let updatedList;
    if (editingItem) {
      updatedList = exercises.map(item => (item.id === editingItem.id ? newItem : item));
    } else {
      updatedList = [...exercises, newItem];
    }

    await exerciseService.save(updatedList);
    setExercises(updatedList);
    setIsFormModalVisible(false);
    form.resetFields();
    setEditingItem(null);
    message.success(editingItem ? 'Cập nhật thành công' : 'Thêm mới thành công');
  };

  const handleDelete = async (id: string) => {
    const updatedList = exercises.filter(item => item.id !== id);
    await exerciseService.save(updatedList);
    setExercises(updatedList);
    message.success('Xóa thành công');
  };

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = muscleFilter === 'All' || ex.muscleGroups.includes(muscleFilter);
    const matchesDifficulty = difficultyFilter === 'All' || ex.difficulty === difficultyFilter;
    return matchesSearch && matchesMuscle && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'green';
      case 'Medium': return 'orange';
      case 'Hard': return 'red';
      default: return 'default';
    }
  };

  return (
    <PageContainer title="Thư viện bài tập">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Filters and Controls */}
        <Card bordered={false} bodyStyle={{ padding: '16px' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Input
                placeholder="Tìm kiếm bài tập..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={12} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Nhóm cơ"
                value={muscleFilter}
                onChange={setMuscleFilter}
                suffixIcon={<FilterOutlined />}
              >
                <Select.Option value="All">Tất cả nhóm cơ</Select.Option>
                <Select.Option value="Chest">Chest</Select.Option>
                <Select.Option value="Back">Back</Select.Option>
                <Select.Option value="Legs">Legs</Select.Option>
                <Select.Option value="Shoulders">Shoulders</Select.Option>
                <Select.Option value="Arms">Arms</Select.Option>
                <Select.Option value="Core">Core</Select.Option>
                <Select.Option value="Full Body">Full Body</Select.Option>
              </Select>
            </Col>
            <Col xs={12} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Mức độ"
                value={difficultyFilter}
                onChange={setDifficultyFilter}
              >
                <Select.Option value="All">Tất cả mức độ</Select.Option>
                <Select.Option value="Easy">Dễ</Select.Option>
                <Select.Option value="Medium">Trung bình</Select.Option>
                <Select.Option value="Hard">Khó</Select.Option>
              </Select>
            </Col>
            <Col xs={24} md={4}>
              <Button
                type="primary"
                block
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingItem(null);
                  form.resetFields();
                  setIsFormModalVisible(true);
                }}
              >
                Thêm bài tập
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Grid View */}
        <Row gutter={[16, 16]}>
          {filteredExercises.map(ex => (
            <Col xs={24} sm={12} lg={8} key={ex.id}>
              <Card
                hoverable
                actions={[
                  <InfoCircleOutlined key="info" onClick={() => {
                    setSelectedExercise(ex);
                    setIsDetailModalVisible(true);
                  }} />,
                  <EditOutlined key="edit" onClick={() => {
                    setEditingItem(ex);
                    form.setFieldsValue(ex);
                    setIsFormModalVisible(true);
                  }} />,
                  <Popconfirm
                    key="delete"
                    title="Xóa bài tập này?"
                    onConfirm={() => handleDelete(ex.id)}
                    okText="Có"
                    cancelText="Không"
                  >
                    <DeleteOutlined style={{ color: 'red' }} />
                  </Popconfirm>
                ]}
              >
                <Card.Meta
                  title={ex.name}
                  description={
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <Space wrap>
                        {ex.muscleGroups.map(m => <Tag key={m}>{m}</Tag>)}
                        <Tag color={getDifficultyColor(ex.difficulty)}>{ex.difficulty}</Tag>
                      </Space>
                      <Paragraph ellipsis={{ rows: 2 }} style={{ margin: '8px 0' }}>
                        {ex.description}
                      </Paragraph>
                      <Text strong type="secondary">
                        {ex.averageCaloriesPerHour} kcal/giờ
                      </Text>
                    </Space>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Space>

      {/* Detail Modal */}
      <Modal
        title={selectedExercise?.name}
        visible={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {selectedExercise && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Title level={5}>Mô tả</Title>
              <Paragraph>{selectedExercise.description}</Paragraph>
            </div>
            <div>
              <Title level={5}>Nhóm cơ tác động</Title>
              <Space wrap>
                {selectedExercise.muscleGroups.map(m => <Tag key={m} color="blue">{m}</Tag>)}
              </Space>
            </div>
            <div>
              <Title level={5}>Mức độ khó</Title>
              <Tag color={getDifficultyColor(selectedExercise.difficulty)}>{selectedExercise.difficulty}</Tag>
            </div>
            <div>
              <Title level={5}>Hướng dẫn thực hiện</Title>
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{selectedExercise.instructions}</Paragraph>
            </div>
          </Space>
        )}
      </Modal>

      {/* Form Modal */}
      <Modal
        title={editingItem ? 'Sửa bài tập' : 'Thêm bài tập mới'}
        visible={isFormModalVisible}
        onCancel={() => setIsFormModalVisible(false)}
        onOk={() => form.submit()}
        destroyOnClose
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrEdit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Tên bài tập" rules={[{ required: true }]}>
                <Input placeholder="Ví dụ: Hít đất" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="difficulty" label="Mức độ khó" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="Easy">Dễ</Select.Option>
                  <Select.Option value="Medium">Trung bình</Select.Option>
                  <Select.Option value="Hard">Khó</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="muscleGroups" label="Nhóm cơ tác động" rules={[{ required: true }]}>
                <Select mode="multiple" placeholder="Chọn các nhóm cơ">
                  <Select.Option value="Chest">Chest</Select.Option>
                  <Select.Option value="Back">Back</Select.Option>
                  <Select.Option value="Legs">Legs</Select.Option>
                  <Select.Option value="Shoulders">Shoulders</Select.Option>
                  <Select.Option value="Arms">Arms</Select.Option>
                  <Select.Option value="Core">Core</Select.Option>
                  <Select.Option value="Full Body">Full Body</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="averageCaloriesPerHour" label="Calo đốt trung bình/giờ" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Mô tả ngắn" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="instructions" label="Hướng dẫn chi tiết" rules={[{ required: true }]}>
            <Input.TextArea rows={5} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default ExerciseLibrary;
