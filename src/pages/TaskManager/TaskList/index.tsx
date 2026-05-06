import React, { useState, useEffect } from 'react';
import { Table, Input, Select, Tag, Space, Button, message, Popconfirm, Card } from 'antd';
import { 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import { getTasks, updateTask, deleteTask, addTask } from '../service';
import { Task, Status, Priority } from '../data.d';
import TaskForm from '../components/TaskForm';
import moment from 'moment';

const { Option } = Select;

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const loadData = () => {
    const data = getTasks();
    setTasks(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let result = [...tasks];

    if (searchText) {
      result = result.filter(t => 
        t.title.toLowerCase().includes(searchText.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter);
    }

    setFilteredTasks(result);
  }, [tasks, searchText, statusFilter]);

  const handleSaveTask = (values: any) => {
    if (editingTask) {
      updateTask(editingTask.id, values);
      message.success('Cập nhật thành công');
    } else {
      addTask(values);
      message.success('Thêm thành công');
    }
    loadData();
    setIsModalVisible(false);
    setEditingTask(undefined);
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
    message.success('Đã xóa công việc');
    loadData();
  };

  const columns = [
    {
      title: 'Tên công việc',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Task) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>{text}</span>
          <span style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.description}</span>
        </Space>
      ),
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      sorter: (a: Task, b: Task) => moment(a.deadline).unix() - moment(b.deadline).unix(),
      render: (deadline: string, record: Task) => (
        <span style={{ 
          color: moment(deadline).isBefore(moment(), 'day') && record.status !== 'done' ? '#ff4d4f' : 'inherit' 
        }}>
          {moment(deadline).format('DD/MM/YYYY')}
        </span>
      ),
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: Priority) => {
        const colors = { High: 'red', Medium: 'orange', Low: 'blue' };
        const labels = { High: 'Cao', Medium: 'Trung bình', Low: 'Thấp' };
        return <Tag color={colors[priority]}>{labels[priority]}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: Status) => {
        const colors = { todo: 'default', doing: 'processing', done: 'success' };
        const labels = { todo: 'Cần làm', doing: 'Đang làm', done: 'Hoàn thành' };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      },
    },
    {
      title: 'Thẻ',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <>
          {tags?.map(tag => (
            <Tag key={tag} style={{ marginBottom: '4px' }}>{tag}</Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Task) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => {
              setEditingTask(record);
              setIsModalVisible(true);
            }} 
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa công việc này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer 
      title="Danh sách công việc"
      extra={[
        <Button 
          key="add" 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => {
            setEditingTask(undefined);
            setIsModalVisible(true);
          }}
        >
          Thêm mới
        </Button>
      ]}
    >
      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Input
              placeholder="Tìm kiếm theo tên..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: 150 }}
              value={statusFilter}
              onChange={value => setStatusFilter(value)}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="todo">Cần làm</Option>
              <Option value="doing">Đang làm</Option>
              <Option value="done">Hoàn thành</Option>
            </Select>
          </Space>
          <div style={{ color: '#8c8c8c' }}>
            Hiển thị {filteredTasks.length} công việc
          </div>
        </Space>

        <Table 
          columns={columns} 
          dataSource={filteredTasks} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <TaskForm
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingTask(undefined);
        }}
        onSave={handleSaveTask}
        initialValues={editingTask}
        title={editingTask ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}
      />
    </PageContainer>
  );
};

export default TaskList;
