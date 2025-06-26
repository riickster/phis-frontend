import React, { useState, useEffect } from 'react';
import {
  Typography,
  Table,
  Button,
  Input,
  Row,
  Col,
  message,
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import UpdateStockModal from '../components/UpdateStockModal';
import AddProductModal from '../components/AddProductModal';

const { Title } = Typography;
const { Search } = Input;

const Inventario = () => {
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);

  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [stockAction, setStockAction] = useState(''); // 'add' or 'remove'
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/v1/products');
      setProducts(res.data);
    } catch (err) {
      message.error('Error al cargar productos');
    }
  };

  const openStockModal = (product, action) => {
    setSelectedProduct(product);
    setStockAction(action);
    setStockModalVisible(true);
  };

  const closeStockModal = () => {
    setStockModalVisible(false);
    setSelectedProduct(null);
    setStockAction('');
  };

  const handleStockUpdateSuccess = () => {
    closeStockModal();
    fetchProducts();
  };

  const closeAddModal = () => setAddModalVisible(false);

  const handleAddProductSuccess = () => {
    closeAddModal();
    fetchProducts();
  };

  const filteredProducts = products.filter((p) => {
    const search = searchText.toLowerCase();
    return (
      p.name.toLowerCase().includes(search) ||
      p.category.toLowerCase().includes(search) ||
      (p.createdBy && p.createdBy.toLowerCase().includes(search)) ||
      (p.lastUpdatedBy && p.lastUpdatedBy.toLowerCase().includes(search))
    );
  });

  const columns = [
    {
      title: 'Producto',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Categoría',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) =>
        stock === 0 ? <span style={{ color: 'red' }}>Sin stock</span> : stock,
    },
    {
      title: 'Creado Por',
      dataIndex: 'createdBy',
      key: 'createdBy',
    },
    {
      title: 'Última Actualización De',
      dataIndex: 'lastUpdatedBy',
      key: 'lastUpdatedBy',
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 260,
      render: (item) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary" size="small" href={`/producto/${item.id}`}>
            Manage
          </Button>
          <Button
            icon={<UploadOutlined />}
            size="small"
            style={{
              backgroundColor: '#52c41a',
              borderColor: '#52c41a',
              color: '#fff',
            }}
            onClick={() => openStockModal(item, 'add')}
          >
            Agregar
          </Button>
          <Button
            icon={<DownloadOutlined />}
            size="small"
            style={{
              backgroundColor: '#f5222d',
              borderColor: '#f5222d',
              color: '#fff',
            }}
            onClick={() => openStockModal(item, 'remove')}
          >
            Remover
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: '0 24px 24px',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
      }}
    >
      <Title level={2} style={{ marginBottom: 16, marginTop: 0 }}>
        Inventario
      </Title>

      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col flex="auto" style={{ marginRight: 16 }}>
          <Search
            placeholder="Buscar producto o categoría"
            allowClear
            enterButton
            onSearch={(value) => setSearchText(value)}
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
          />
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{
              backgroundColor: '#52c41a',
              borderColor: '#52c41a',
            }}
            onClick={() => setAddModalVisible(true)}
          >
            Añadir producto
          </Button>
        </Col>
      </Row>

      <Table
        dataSource={filteredProducts}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        style={{ flexGrow: 1 }}
        bordered
      />

      <UpdateStockModal
        product={selectedProduct}
        action={stockAction}
        visible={stockModalVisible}
        onClose={closeStockModal}
        onSuccess={handleStockUpdateSuccess}
      />

      <AddProductModal
        visible={addModalVisible}
        onClose={closeAddModal}
        onSuccess={handleAddProductSuccess}
      />
    </div>
  );
};

export default Inventario;
