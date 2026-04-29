import React, { useState, useEffect } from 'react';
import { GridContent } from '@ant-design/pro-layout';
import { Row, Col, Card, Statistic, Timeline, Typography, Space, Tag } from 'antd';
import { FireOutlined, ThunderboltOutlined, TrophyOutlined, HistoryOutlined } from '@ant-design/icons';
import Chart from 'react-apexcharts';
import { workoutService, healthMetricService, goalService } from '@/services/FitnessTracker';
import { WorkoutItem, HealthMetricItem, GoalItem } from '../data';
import moment from 'moment';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([]);
  const [metrics, setMetrics] = useState<HealthMetricItem[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const w = await workoutService.query();
      const m = await healthMetricService.query();
      const g = await goalService.query();
      setWorkouts(w);
      setMetrics(m);
      setGoals(g);
    };
    fetchData();
  }, []);

  // Stats calculation
  const thisMonthWorkouts = workouts.filter(w => moment(w.date).isSame(moment(), 'month')).length;
  const totalCalories = workouts.reduce((acc, curr) => acc + curr.calories, 0);
  const streak = 5; // Mock streak
  const goalCompletion = goals.length > 0 ? Math.round((goals.reduce((acc, curr) => acc + (curr.currentValue / curr.targetValue), 0) / goals.length) * 100) : 0;

  // Chart data: Workouts per week
  const weeklyWorkoutData = [2, 3, 4, 2]; // Mock weekly data
  const barChartOptions: any = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
    dataLabels: { enabled: false },
    xaxis: { categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'] },
    colors: ['#1890ff'],
  };

  // Chart data: Weight change
  const lineChartOptions: any = {
    chart: { type: 'line', toolbar: { show: false } },
    stroke: { curve: 'smooth', width: 3 },
    xaxis: { categories: metrics.map(m => moment(m.date).format('DD/MM')) },
    markers: { size: 4 },
    colors: ['#52c41a'],
    yaxis: { title: { text: 'Weight (kg)' } },
  };
  const weightSeries = [{ name: 'Weight', data: metrics.map(m => m.weight) }];

  return (
    <GridContent>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={3}>Dashboard Sức khỏe & Luyện tập</Title>

        {/* Quick Stats */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Buổi tập trong tháng"
                value={thisMonthWorkouts}
                prefix={<ThunderboltOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Calo đã đốt"
                value={totalCalories}
                suffix="kcal"
                prefix={<FireOutlined style={{ color: '#ff4d4f' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Chuỗi ngày tập (Streak)"
                value={streak}
                suffix="ngày"
                prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Mục tiêu hoàn thành"
                value={goalCompletion}
                suffix="%"
                prefix={<TrophyOutlined style={{ color: '#52c41a' }} />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {/* Workout Chart */}
          <Col xs={24} lg={12}>
            <Card title="Tần suất luyện tập theo tuần">
              <Chart
                options={barChartOptions}
                series={[{ name: 'Workouts', data: weeklyWorkoutData }]}
                type="bar"
                height={300}
              />
            </Card>
          </Col>
          {/* Weight Chart */}
          <Col xs={24} lg={12}>
            <Card title="Thay đổi cân nặng">
              <Chart options={lineChartOptions} series={weightSeries} type="line" height={300} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {/* Recent Workouts */}
          <Col xs={24} md={12}>
            <Card title="Hoạt động gần đây" extra={<HistoryOutlined />}>
              <Timeline mode="left">
                {workouts.slice(-5).reverse().map(w => (
                  <Timeline.Item key={w.id} label={moment(w.date).format('DD/MM/YYYY')}>
                    <Text strong>{w.type}</Text> - {w.duration} phút ({w.calories} kcal)
                    <br />
                    <Tag color={w.status === 'Completed' ? 'green' : 'red'}>
                      {w.status === 'Completed' ? 'Hoàn thành' : 'Bỏ lỡ'}
                    </Tag>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Col>
        </Row>
      </Space>
    </GridContent>
  );
};

export default Dashboard;
