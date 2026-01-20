import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber } from 'antd';

interface ProductModalProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (values: any) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ visible, onCancel, onSubmit }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            form.resetFields();
        }
    }, [visible, form]);

    const handleOk = () => {
        form
            .validateFields()
            .then((values) => {
                onSubmit(values);
                form.resetFields();
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    };

    return (
        <Modal
            title="Thêm sản phẩm mới"
            visible={visible}
            onOk={handleOk}
            onCancel={onCancel}
            okText="Thêm"
            cancelText="Hủy"
        >
            <Form
                form={form}
                layout="vertical"
                name="form_in_modal"
                initialValues={{ modifier: 'public' }}
            >
                <Form.Item
                    name="name"
                    label="Tên sản phẩm"
                    rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="price"
                    label="Giá"
                    rules={[
                        { required: true, message: 'Vui lòng nhập giá sản phẩm!' },
                        { type: 'number', min: 1, message: 'Giá phải là số dương!' },
                    ]}
                >
                    <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value!.replace(/\$\s?|(,*)/g, '')} addonAfter="VND" />
                </Form.Item>
                <Form.Item
                    name="quantity"
                    label="Số lượng"
                    rules={[
                        { required: true, message: 'Vui lòng nhập số lượng!' },
                        { type: 'number', min: 1, message: 'Số lượng phải là số nguyên dương!' }
                    ]}
                >
                    <InputNumber style={{ width: '100%' }} precision={0} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ProductModal;
