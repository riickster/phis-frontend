import React from 'react';
import { Modal, Form, Input, message } from 'antd';
import axios from 'axios';
import { useWatch } from 'antd/es/form/Form';

const UpdateStockModal = ({ product, action, visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const watchedAmount = useWatch('amount', form) || 0;

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const endpoint = `http://localhost:4000/api/v1/products/${product.id}/${action}-stock`;
      await axios.post(endpoint, values);
      message.success(
        action === 'add' ? 'Stock agregado correctamente' : 'Stock removido correctamente'
      );
      onSuccess();
      form.resetFields();
    } catch (err) {
      message.error('Error al actualizar el stock');
    }
  };

  return (
    <Modal
      title={action === 'add' ? 'Agregar stock al producto' : 'Remover stock del producto'}
      open={visible}
      onOk={handleSubmit}
      onCancel={() => {
        onClose();
        form.resetFields();
      }}
      okText={action === 'add' ? 'Agregar' : 'Remover'}
      okButtonProps={{
        style: {
          backgroundColor: action === 'add' ? '#52c41a' : '#f5222d',
          borderColor: action === 'add' ? '#52c41a' : '#f5222d',
        },
      }}
      cancelText="Cancelar"
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Cantidad"
          name="amount"
          rules={[
            { required: true, message: 'Ingrese la cantidad' },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                if (!/^\d+$/.test(value)) return Promise.reject('Solo se permiten números enteros');
                if (value.length > 1 && value.startsWith('0'))
                  return Promise.reject('No puede empezar con 0');
                if (action === 'remove' && Number(value) > product.stock)
                  return Promise.reject('La cantidad no puede ser mayor al stock actual');
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            maxLength={4}
            inputMode="numeric"
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              form.setFieldsValue({ amount: val });
            }}
          />
        </Form.Item>

        <Form.Item
          label="Motivo"
          name="reason"
          rules={[{ required: true, message: 'Ingrese el motivo' }]}
        >
          <Input.TextArea />
        </Form.Item>
      </Form>

      {product && (
        <div
          style={{
            marginTop: 8,
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            justifyContent: 'center',
          }}
        >
          <span>Stock Resultante:</span>
          <strong>{product.stock}</strong>
          <span>{action === 'add' ? '+' : '-'}</span>
          <strong>{watchedAmount}</strong>
          <span>=</span>
          <strong
            style={{
              color: action === 'remove' ? '#f5222d' : '#52c41a',
              fontSize: 18,
            }}
          >
            {action === 'add'
              ? product.stock + Number(watchedAmount)
              : Math.max(product.stock - Number(watchedAmount), 0)}
          </strong>
        </div>
      )}
    </Modal>
  );
};

export default UpdateStockModal;
