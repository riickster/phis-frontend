import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Typography,
  Card,
  Row,
  Col,
  List,
  Divider,
  Descriptions,
  Button,
  message,
} from 'antd';
import axios from 'axios';
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
} from 'recharts';

const { Title } = Typography;

const COLORS = ['#52c41a', '#f5222d'];

const ProductManage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // For visual editing of name and category (no backend update yet)
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({ name: '', category: '' });

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:4000/api/v1/products/${id}`);
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

  // Calculate pieData and barData from logs
  const pieData = [
    {
      name: 'Añadido',
      value: logs.filter((l) => l.action === 'added').reduce((a, b) => a + b.amount, 0),
    },
    {
      name: 'Removido',
      value: logs.filter((l) => l.action === 'removed').reduce((a, b) => a + b.amount, 0),
    },
  ];

  const barData = logs.map((log) => ({
    name: log.date,
    amount: log.amount,
  }));

  // Handlers for editing
  const onEditClick = () => setIsEditing(true);
  const onCancelEdit = () => {
    setIsEditing(false);
    setEditValues({ name: product.name, category: product.category });
  };

  const onSaveEdit = () => {
    // Just visual update for now - no API call yet
    setProduct((prev) => ({
      ...prev,
      name: editValues.name,
      category: editValues.category,
    }));
    setIsEditing(false);
    message.success('Cambios guardados (solo visual)');
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

        <div style={{ marginTop: 16 }}>
          {!isEditing ? (
            <Button type="primary" onClick={onEditClick}>
              Editar
            </Button>
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
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#1890ff" />
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
    </div>
  );
};

export default ProductManage;
