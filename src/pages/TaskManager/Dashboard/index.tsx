import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Button } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  UnorderedListOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import { getTasks, getDashboardStats, addTask } from '../service';
import { Task } from '../data.d';
import TaskForm from '../components/TaskForm';

const { Title } = Typography;

const TaskDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const loadData = () => {
    const data = getTasks();
    setTasks(data);
  };

  useEffect(() => {
    loadData();
    // Refresh every minute to update overdue status
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const stats = getDashboardStats(tasks);

  const handleAddTask = (values: any) => {
    addTask(values);
    loadData();
    setIsModalVisible(false);
  };

  return (
    <PageContainer title="Dashboard Quản lý công việc">
      <div style={{ padding: '24px' }}>
        <Row gutter={[16, 16]} justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
          <Col>
            <Title level={4}>Tổng quan công việc</Title>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setIsModalVisible(true)}
            >
              Thêm công việc mới
            </Button>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={8}>
            <Card hoverable bordered={false} style={{ borderRadius: '12px', borderLeft: '5px solid #1890ff' }}>
              <Statistic
                title="Tổng số công việc"
                value={stats.total}
                prefix={<UnorderedListOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card hoverable bordered={false} style={{ borderRadius: '12px', borderLeft: '5px solid #52c41a' }}>
              <Statistic
                title="Đã hoàn thành"
                value={stats.completed}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card hoverable bordered={false} style={{ borderRadius: '12px', borderLeft: '5px solid #ff4d4f' }}>
              <Statistic
                title="Quá hạn"
                value={stats.overdue}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card 
          title="Ghi chú nhanh" 
          style={{ marginTop: '24px', borderRadius: '12px' }}
        >
          <Typography.Paragraph>
            Chào mừng bạn đến với ứng dụng Quản lý công việc cá nhân. 
            Bạn có {stats.overdue > 0 ? `${stats.overdue} công việc đang quá hạn, hãy kiểm tra ngay!` : 'tất cả công việc đều trong tiến độ.'}
          </Typography.Paragraph>
        </Card>

        <TaskForm
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onSave={handleAddTask}
          title="Thêm công việc mới"
        />
      </div>
    </PageContainer>
  );
};

export default TaskDashboard;
