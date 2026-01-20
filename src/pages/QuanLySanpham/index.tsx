import React, { useState } from 'react';
import { Table, Button, Input, Space, Popconfirm, message, Card } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import ProductModal from './components/ProductModal';
import type { ColumnsType } from 'antd/es/table';

interface Product {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

const initialData: Product[] = [
    { id: 1, name: 'Laptop Dell XPS 13', price: 25000000, quantity: 10 },
    { id: 2, name: 'iPhone 15 Pro Max', price: 30000000, quantity: 15 },
    { id: 3, name: 'Samsung Galaxy S24', price: 22000000, quantity: 20 },
    { id: 4, name: 'iPad Air M2', price: 18000000, quantity: 12 },
    { id: 5, name: 'MacBook Air M3', price: 28000000, quantity: 8 },
    { id: 6, name: 'Laptop Acer Aspire 5', price: 15000000, quantity: 18 },
    { id: 7, name: 'Sony WH-1000XM5', price: 8500000, quantity: 25 },
    { id: 8, name: 'Logitech MX Master 3S', price: 2500000, quantity: 30 },
    { id: 9, name: 'Dell UltraSharp U2723QE', price: 14000000, quantity: 10 },
    { id: 10, name: 'Keychron K2V2', price: 2000000, quantity: 40 },
];

const QuanLySanpham: React.FC = () => {
    const [products, setProducts] = useState<Product[]>(initialData);
    const [searchText, setSearchText] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);

    const filteredProducts = products.filter((item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleAddProduct = (values: Omit<Product, 'id'>) => {
        const newProduct: Product = {
            id: Date.now(),
            ...values,
        };
        setProducts([...products, newProduct]);
        setIsModalVisible(false);
        message.success('Thêm sản phẩm thành công!');
    };

    const handleDeleteProduct = (id: number) => {
        const newProducts = products.filter((item) => item.id !== id);
        setProducts(newProducts);
        message.success('Xóa sản phẩm thành công!');
    };

    const columns: ColumnsType<Product> = [
        {
            title: 'STT',
            key: 'index',
            render: (_: any, __: any, index: number) => index + 1,
            width: 60,
            align: 'center',
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            align: 'center',
            render: (text: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(text),
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center',
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            render: (_: any, record: Product) => (
                <Space size="middle">
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa sản phẩm này?"
                        onConfirm={() => handleDeleteProduct(record.id)}
                        okText="Đồng ý"
                        cancelText="Hủy"
                    >
                        <Button type="primary" danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card title="Quản lý sản phẩm">
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Input.Search
                    placeholder="Tìm kiếm sản phẩm..."
                    allowClear
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                    Thêm sản phẩm
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={filteredProducts}
                rowKey="id"
                pagination={{ pageSize: 5 }}
            />

            <ProductModal
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={handleAddProduct}
            />
        </Card>
    );
};

export default QuanLySanpham;
