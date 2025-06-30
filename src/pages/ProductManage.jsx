import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Card,
  Row,
  Col,
  List,
  Divider,
  Descriptions,
  Popconfirm,
  Button,
  message,
} from 'antd';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import {
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

import UpdateStockModal from '../components/UpdateStockModal';
import { useAuth } from '../contexts/AuthContext';

import api from '../lib/api'

const { Title } = Typography;
const COLORS = ['#52c41a', '#f5222d'];

const ProductManage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({ name: '', category: '' });

  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [stockAction, setStockAction] = useState('');

  const navigate = useNavigate();

  const { user } = useAuth();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${id}`);
      setProduct(res.data.product);
      setLogs(res.data.logs || []);
      setEditValues({
        name: res.data.product.name,
        category: res.data.product.category,
      });
    } catch (err) {
      message.error('Error al cargar el producto');
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    {
      name: 'Añadido',
      value: logs
        .filter((l) => l.action === 'added')
        .reduce((acc, curr) => Number(acc) + Number(curr.amount), 0),
    },
    {
      name: 'Removido',
      value: logs
        .filter((l) => l.action === 'removed')
        .reduce((acc, curr) => Number(acc) + Number(curr.amount), 0),
    },
  ];

  const grouped = logs.reduce((acc, log) => {
    const date = log.date;
    if (!acc[date]) acc[date] = { date, added: 0, removed: 0 };
    if (log.action === 'added') acc[date].added += log.amount;
    else if (log.action === 'removed') acc[date].removed += log.amount;
    return acc;
  }, {});
  const barData = Object.values(grouped);

  const onEditClick = () => setIsEditing(true);
  const onCancelEdit = () => {
    setIsEditing(false);
    setEditValues({ name: product.name, category: product.category });
  };

  const onSaveEdit = async () => {
    try {
      await api.put(`/products/${id}`, {
        name: editValues.name,
        category: editValues.category,
        by: user?.displayName
      });
      message.success('Producto actualizado correctamente');
      await fetchProduct();
      setIsEditing(false);
    } catch (error) {
      message.error('Error al actualizar el producto');
    }
  };

  const openStockModal = (action) => {
    setStockAction(action);
    setStockModalVisible(true);
  };
  const closeStockModal = () => {
    setStockModalVisible(false);
    setStockAction('');
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/v1/products/${id}`);
      message.success('Producto eliminado');
      navigate('/inventario');
    } catch (err) {
      message.error('Error al eliminar el producto');
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!product) return <div>Producto no encontrado</div>;

  return (
    <div style={{ paddingLeft: 24, paddingRight: 24 }}>
      <Title level={2} style={{ marginBottom: 16, marginTop: 0 }}>
        Detalles del Producto
      </Title>

      <Card style={{ marginBottom: 24, backgroundColor: '#fafafa' }}>
        <Descriptions
          size="small"
          column={2}
          labelStyle={{ fontWeight: 'bold' }}
          contentStyle={{ marginLeft: 8 }}
        >
          <Descriptions.Item label="Nombre">
            {isEditing ? (
              <input
                type="text"
                value={editValues.name}
                onChange={(e) =>
                  setEditValues((ev) => ({ ...ev, name: e.target.value }))
                }
                style={{ width: '100%', padding: '4px' }}
              />
            ) : (
              product.name
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Categoría">
            {isEditing ? (
              <input
                type="text"
                value={editValues.category}
                onChange={(e) =>
                  setEditValues((ev) => ({ ...ev, category: e.target.value }))
                }
                style={{ width: '100%', padding: '4px' }}
              />
            ) : (
              product.category
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Stock Actual">{product.stock}</Descriptions.Item>
          <Descriptions.Item label="Creado por">{product.createdBy}</Descriptions.Item>
          <Descriptions.Item label="Última actualización por">{product.lastUpdatedBy}</Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {!isEditing ? (
            <>
              <Button type="primary" onClick={onEditClick}>
                Editar
              </Button>
              <Button
                icon={<UploadOutlined />}
                type="default"
                style={{
                  backgroundColor: '#52c41a',
                  color: 'white',
                  borderColor: '#52c41a',
                }}
                onClick={() => openStockModal('add')}
              >
                Añadir Stock
              </Button>
              <Button
                icon={<DownloadOutlined />}
                type="default"
                style={{
                  backgroundColor: '#fa8c16',
                  color: 'white',
                  borderColor: '#fa8c16',
                }}
                onClick={() => openStockModal('remove')}
              >
                Remover Stock
              </Button>
              <Popconfirm
                title="¿Seguro que quieres eliminar este producto?"
                onConfirm={() => handleDelete()}
                okText="Sí"
                cancelText="No"
              >
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  style={{
                    backgroundColor: '#ff0000',
                    color: 'white',
                    borderColor: '#fa8c16',
                  }}
                >
                  Eliminar
                </Button>
              </Popconfirm>
            </>
          ) : (
            <>
              <Button type="primary" onClick={onSaveEdit} style={{ marginRight: 8 }}>
                Guardar
              </Button>
              <Button onClick={onCancelEdit}>Cancelar</Button>
            </>
          )}
        </div>
      </Card>

      <Title level={2}>Estadísticas</Title>
      <Row gutter={24} style={{ marginBottom: 32 }}>
        <Col xs={24} md={12}>
          <Card title="Añadido vs Removido">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Historial de Stock">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="added" fill="#52c41a" name="Añadido" />
                <Bar dataKey="removed" fill="#f5222d" name="Removido" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Title level={3}>Timelog</Title>
      <Card>
        <List
          dataSource={logs}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={`${item.date} - ${item.action.toUpperCase()} (${item.amount})`}
                description={`Por: ${item.by} | Motivo: ${item.reason}`}
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Modal para actualizar stock (reutilizado) */}
      <UpdateStockModal
        product={product}
        action={stockAction}
        visible={stockModalVisible}
        onClose={closeStockModal}
        onSuccess={() => {
          closeStockModal();
          fetchProduct();
        }}
      />
    </div>
  );
};

export default ProductManage;
