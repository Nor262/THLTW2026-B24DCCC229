import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, Space, Typography, Row, Col, message, Card } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import { Product } from '@/models/product';

const { Option } = Select;
const { Text } = Typography;

interface CreateOrderProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const CreateOrder: React.FC<CreateOrderProps> = ({ visible, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const { products } = useModel('product');
    const { addOrder } = useModel('order');
    const [totalAmount, setTotalAmount] = useState(0);

    // Watch for changes in products to update max quantities and total price
    const calculateTotal = (values: any) => {
        const selectedProducts = values.products || [];
        let total = 0;
        selectedProducts.forEach((item: any) => {
            if (item?.productId && item?.quantity) {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    total += product.price * item.quantity;
                }
            }
        });
        setTotalAmount(total);
    };

    const handleValuesChange = (_: any, allValues: any) => {
        calculateTotal(allValues);
    };

    const onFinish = (values: any) => {
        const orderProducts = values.products.map((item: any) => {
            const product = products.find(p => p.id === item.productId);
            return {
                productId: item.productId,
                productName: product?.name,
                quantity: item.quantity,
                price: product?.price,
            };
        });

        const newOrder = {
            customerName: values.customerName,
            phone: values.phone,
            address: values.address,
            products: orderProducts,
            totalAmount: totalAmount,
        };

        addOrder(newOrder);
        message.success('Tạo đơn hàng thành công');
        form.resetFields();
        setTotalAmount(0);
        onSuccess();
    };

    return (
        <Modal
            title="Tạo đơn hàng mới"
            visible={visible}
            onCancel={onCancel}
            onOk={() => form.submit()}
            width={800}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onValuesChange={handleValuesChange}
                initialValues={{ products: [{}] }}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="customerName"
                            label="Tên khách hàng"
                            rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="phone"
                            label="Số điện thoại"
                            rules={[
                                { required: true, message: 'Vui lòng nhập số điện thoại' },
                                { pattern: /^\d{10,11}$/, message: 'Số điện thoại phải từ 10-11 số' }
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item
                    name="address"
                    label="Địa chỉ"
                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                >
                    <Input />
                </Form.Item>

                <Form.List name="products">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, fieldKey, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'productId']}
                                        fieldKey={[fieldKey, 'productId']}
                                        rules={[{ required: true, message: 'Chọn sản phẩm' }]}
                                        style={{ width: 300 }}
                                    >
                                        <Select placeholder="Chọn sản phẩm" showSearch optionFilterProp="children">
                                            {products.map(p => (
                                                <Option key={p.id} value={p.id} disabled={p.quantity === 0}>
                                                    {p.name} (Tồn: {p.quantity}, Giá: {p.price.toLocaleString()})
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'quantity']}
                                        fieldKey={[fieldKey, 'quantity']}
                                        dependencies={[['products', name, 'productId']]}
                                        rules={[
                                            { required: true, message: 'Nhập SL' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    const productId = getFieldValue(['products', name, 'productId']);
                                                    const product = products.find(p => p.id === productId);
                                                    if (!value || !product) return Promise.resolve();
                                                    if (value > product.quantity) {
                                                        return Promise.reject(new Error(`Tối đa ${product.quantity}`));
                                                    }
                                                    return Promise.resolve();
                                                },
                                            }),
                                        ]}
                                    >
                                        <InputNumber min={1} placeholder="SL" />
                                    </Form.Item>
                                    <MinusCircleOutlined onClick={() => remove(name)} />
                                </Space>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    Thêm sản phẩm
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>

                <Card>
                    <Row justify="end">
                        <Text strong style={{ fontSize: 18 }}>
                            Tổng tiền: {totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                        </Text>
                    </Row>
                </Card>
            </Form>
        </Modal>
    );
};

export default CreateOrder;
