// src/pages/Devices.tsx
import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { listDevices, createDevice, deleteDevice, updateDevice } from '../services/devices'
import type { Device } from '../services/devices'

export default function Devices() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  // Load devices on mount
  const loadDevices = async () => {
    setLoading(true)
    try {
      const data = await listDevices()
      setDevices(data)
    } catch (err) {
      console.error(err)
      message.error('Failed to load devices')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDevices()
  }, [])

  // Handle new device creation
  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      await createDevice({
        model: values.model,
        location: values.location,
        status: values.status,
      })
      message.success('Device created successfully!')
      form.resetFields()
      setIsModalOpen(false)
      loadDevices()
    } catch (err) {
      console.error(err)
      message.error('Failed to create device')
    }
  }

  // Optional actions (update / delete)
  const handleUpdateStatus = async (id: string, status: Device['status']) => {
    try {
      await updateDevice(id, { status })
      message.success(`Device marked as ${status}`)
      loadDevices()
    } catch (err) {
      console.error(err)
      message.error('Failed to update device status')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDevice(id)
      message.success('Device deleted successfully')
      loadDevices()
    } catch (err) {
      console.error(err)
      message.error('Failed to delete device')
    }
  }

  // Table columns
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Model', dataIndex: 'model', key: 'model' },
    { title: 'Location', dataIndex: 'location', key: 'location' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: Device['status']) => {
        const colors: Record<Device['status'], string> = {
          online: 'green',
          offline: 'volcano',
          busy: 'gold',
          maintenance: 'blue',
        }
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Device) => (
        <Space>
          <Button size="small" onClick={() => handleUpdateStatus(record.id, 'maintenance')}>
            Maintenance
          </Button>
          <Button size="small" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ margin: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Devices</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Device
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={devices}
        columns={columns}
        loading={loading}
        pagination={false}
      />

      <Modal
        title="Add Device"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleCreate}
        okText="Create"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Model"
            name="model"
            rules={[{ required: true, message: 'Please enter the device model' }]}
          >
            <Input placeholder="Bioscope Mk4" />
          </Form.Item>

          <Form.Item
            label="Location"
            name="location"
            rules={[{ required: true, message: 'Please enter the device location' }]}
          >
            <Input placeholder="Lab 4" />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            initialValue="online"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { value: 'online', label: 'Online' },
                { value: 'offline', label: 'Offline' },
                { value: 'busy', label: 'Busy' },
                { value: 'maintenance', label: 'Maintenance' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
