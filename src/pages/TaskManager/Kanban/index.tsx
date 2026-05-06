import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, Tag, Typography, Space, Button, message, Tooltip } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  CalendarOutlined 
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import { getTasks, saveTasks, updateTask, deleteTask, addTask } from '../service';
import { Task, Status } from '../data.d';
import TaskForm from '../components/TaskForm';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;

const COLUMNS: { id: Status; title: string; color: string }[] = [
  { id: 'todo', title: 'Cần làm', color: '#1890ff' },
  { id: 'doing', title: 'Đang làm', color: '#faad14' },
  { id: 'done', title: 'Hoàn thành', color: '#52c41a' },
];

const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const loadData = () => {
    setTasks(getTasks());
  };

  useEffect(() => {
    loadData();
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const taskToUpdate = tasks.find(t => t.id === draggableId);
    if (taskToUpdate) {
      const newStatus = destination.droppableId as Status;
      updateTask(draggableId, { status: newStatus });
      
      // Update local state for immediate feedback
      const newTasks = Array.from(tasks);
      const index = newTasks.findIndex(t => t.id === draggableId);
      newTasks[index] = { ...newTasks[index], status: newStatus };
      setTasks(newTasks);
      
      message.success(`Đã di chuyển công việc sang "${COLUMNS.find(c => c.id === newStatus)?.title}"`);
    }
  };

  const handleSaveTask = (values: any) => {
    if (editingTask) {
      updateTask(editingTask.id, values);
      message.success('Cập nhật công việc thành công');
    } else {
      addTask(values);
      message.success('Thêm công việc thành công');
    }
    loadData();
    setIsModalVisible(false);
    setEditingTask(undefined);
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
    message.success('Đã xóa công việc');
    loadData();
  };

  const getPriorityTag = (priority: string) => {
    const colors = { High: 'red', Medium: 'orange', Low: 'blue' };
    const labels = { High: 'Cao', Medium: 'Trung bình', Low: 'Thấp' };
    return <Tag color={colors[priority]}>{labels[priority]}</Tag>;
  };

  return (
    <PageContainer 
      title="Kanban Board"
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
          Thêm công việc
        </Button>
      ]}
    >
      <div style={{ padding: '24px', overflowX: 'auto' }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{ display: 'flex', gap: '16px', minWidth: '900px' }}>
            {COLUMNS.map(column => (
              <div 
                key={column.id} 
                style={{ 
                  flex: 1, 
                  backgroundColor: '#f0f2f5', 
                  borderRadius: '8px', 
                  padding: '12px',
                  minHeight: '500px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Title level={5} style={{ margin: 0 }}>
                    <span style={{ borderLeft: `4px solid ${column.color}`, paddingLeft: '8px' }}>
                      {column.title}
                    </span>
                  </Title>
                  <Tag color={column.color}>{tasks.filter(t => t.status === column.id).length}</Tag>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={{
                        flex: 1,
                        backgroundColor: snapshot.isDraggingOver ? '#e6f7ff' : 'transparent',
                        transition: 'background-color 0.2s ease',
                        padding: '4px',
                        borderRadius: '4px'
                      }}
                    >
                      {tasks
                        .filter(task => task.status === column.id)
                        .map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                hoverable
                                size="small"
                                style={{
                                  marginBottom: '12px',
                                  borderRadius: '8px',
                                  boxShadow: snapshot.isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                                  ...provided.draggableProps.style
                                }}
                                actions={[
                                  <EditOutlined 
                                    key="edit" 
                                    onClick={() => {
                                      setEditingTask(task);
                                      setIsModalVisible(true);
                                    }} 
                                  />,
                                  <Tooltip key="delete" title="Xóa">
                                    <DeleteOutlined 
                                      style={{ color: '#ff4d4f' }} 
                                      onClick={() => handleDeleteTask(task.id)} 
                                    />
                                  </Tooltip>
                                ]}
                              >
                                <Space direction="vertical" style={{ width: '100%' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Text strong>{task.title}</Text>
                                    {getPriorityTag(task.priority)}
                                  </div>
                                  
                                  {task.description && (
                                    <Paragraph 
                                      ellipsis={{ rows: 2 }} 
                                      type="secondary" 
                                      style={{ fontSize: '12px', margin: 0 }}
                                    >
                                      {task.description}
                                    </Paragraph>
                                  )}

                                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Space size={4}>
                                      <CalendarOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
                                      <Text type={moment(task.deadline).isBefore(moment(), 'day') && task.status !== 'done' ? 'danger' : 'secondary'} style={{ fontSize: '11px' }}>
                                        {moment(task.deadline).format('DD/MM/YYYY')}
                                      </Text>
                                    </Space>
                                    
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                      {task.tags?.slice(0, 2).map(tag => (
                                        <Tag key={tag} style={{ fontSize: '10px', margin: 0 }}>{tag}</Tag>
                                      ))}
                                    </div>
                                  </div>
                                </Space>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

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

export default KanbanBoard;
