import { useState, useEffect } from 'react';
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
import * as XLSX from 'xlsx';

import UpdateStockModal from '../components/UpdateStockModal';
import AddProductModal from '../components/AddProductModal';

import api from '../lib/api';

const { Title } = Typography;
const { Search } = Input;

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);

  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [stockAction, setStockAction] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
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

  const handleExportExcel = async () => {
    try {
      message.loading({ content: 'Generando Excel...', key: 'export' });

      const productsWithLogs = await Promise.all(
        products.map(async (p) => {
          const res = await api.get(`/products/${p.id}`);
          return { ...p, logs: res.data.logs || [] };
        })
      );

      // Hoja de productos
      const productData = productsWithLogs.map((p) => ({
        ID: p.id,
        Nombre: p.name,
        Categoría: p.category,
        Stock: p.stock,
        CreadoPor: p.createdBy,
        UltimaActualizacionPor: p.lastUpdatedBy,
      }));

      // Hoja de logs
      const logsData = productsWithLogs.flatMap((p) =>
        p.logs.map((log) => ({
          ProductoID: p.id,
          Producto: p.name,
          Acción: log.action,
          Cantidad: log.amount,
          Fecha: log.date,
          Por: log.by,
          Motivo: log.reason,
        }))
      );

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(productData), 'Productos');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(logsData), 'Logs');

      XLSX.writeFile(wb, 'inventario.xlsx');

      message.success({ content: 'Excel generado!', key: 'export' });
    } catch (error) {
      console.error(error);
      message.error({ content: 'Error al generar Excel', key: 'export' });
    }
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
            icon={<DownloadOutlined />}
            style={{ marginRight: 8 }}
            onClick={handleExportExcel}
          >
            Exportar Excel
          </Button>
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

export default Inventory;
