import React from 'react';
import { Modal, Form, Input, message } from 'antd';
import axios from 'axios';

const AddProductModal = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await axios.post('http://localhost:4000/api/v1/products', values);
      message.success('Producto creado correctamente');
      onSuccess();
      form.resetFields();
    } catch (err) {
      message.error('Error al crear el producto');
    }
  };

  return (
    <Modal
      title="Añadir producto"
      open={visible}
      onOk={handleSubmit}
      onCancel={() => {
        onClose();
        form.resetFields();
      }}
      okText="Crear"
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Nombre"
          name="name"
          rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Categoría"
          name="category"
          rules={[{ required: true, message: 'Por favor ingrese la categoría' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Stock inicial"
          name="stock"
          rules={[
            { required: true, message: 'Por favor ingrese el stock inicial' },
            {
              pattern: /^[1-9]\d*$/,
              message: 'Ingrese un número entero positivo',
            },
          ]}
        >
          <Input type="number" min={1} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddProductModal;
