// src/pages/Devices.tsx
import { useEffect, useState } from 'react'
import { Card, Table, Button, Modal, Form, Input, message, Popconfirm, Space, ConfigProvider } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { listDevices, createDevice, deleteDevice, type DeviceRecord } from '../services/devices'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Devices() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // normalize role to match backend ("ADMIN")
  const isAdmin = (user?.role ?? '').toString().toUpperCase() === 'ADMIN'
  const [data, setData] = useState<DeviceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  // Load devices on mount
  const loadDevices = async () => {
    setLoading(true)
    try {
      const rows = await listDevices()
      setData(rows)
    } catch (e: any) {
      const status = e?.response?.status ?? e?.status
      if (status === 401) { await logout(); navigate('/login'); return }
      message.error('Failed to load devices')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  // Handle new device creation
  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      await createDevice({
        deviceId: values.deviceId.trim(),
        lab: values.lab.trim(),
        ipAddress: values.ipAddress.trim(),
        port: Number(values.port),
      })
      message.success('Device added')
      form.resetFields()
      setOpen(false)
      void load()
    } catch (err: any) {
      const status = err?.response?.status ?? err?.status
      if (status === 401) { await logout(); navigate('/login'); return }
      if (status === 403) message.error('Forbidden: admin only')
      else message.error(err?.response?.data?.message || err?.message || 'Failed to add device')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDevice(id)
      message.success('Device removed')
      void load()
    } catch (err: any) {
      const status = err?.response?.status ?? err?.status
      if (status === 401) { await logout(); navigate('/login'); return }
      if (status === 403) message.error('Forbidden: admin only')
      else if (status === 404) message.error('Device not found')
      else message.error('Failed to delete device')
    }
  }

  const columns: ColumnsType<DeviceRecord> = [
    { title: 'Device ID', dataIndex: 'deviceId', key: 'deviceId' },
    { title: 'Lab', dataIndex: 'lab', key: 'lab' },
    { title: 'IP', dataIndex: 'ipAddress', key: 'ipAddress', render: (v) => v ?? '—' },
    { title: 'Port', dataIndex: 'port', key: 'port', render: (v) => v ?? '—' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {isAdmin ? (
            <Popconfirm title="Delete device?" onConfirm={() => handleDelete(record.deviceId)}>
              <Button danger type="text">Delete</Button>
            </Popconfirm>
          ) : null}
        </Space>
      )
    }
  ]

  return (
    <Card
      title="Devices"
      extra={
        isAdmin ? (
          <Button type="primary" onClick={() => setOpen(true)}>
            Add Device
          </Button>
        ) : null
      }
    >
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={{ pageSize: 8 }} />

      <Modal 
        title="Add Device" 
        open={open} 
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button key="cancel" onClick={() => { setOpen(false); form.resetFields() }} style={{ minWidth: 88 }}>
              Cancel
            </Button>
            <Button key="submit" type="primary" onClick={onCreate} style={{ minWidth: 88 }}>
              Add
            </Button>
          </div>
        }
        onCancel={() => { setOpen(false); form.resetFields() }}
        centered
        width={400}
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

          <Form.Item label="IP Address" name="ipAddress" rules={[
            { required: true, message: 'IP address is required' },
            { pattern: /^(\d{1,3}\.){3}\d{1,3}$/, message: 'Enter valid IP' }
          ]}>
            <Input placeholder="e.g. 192.168.10.101" />
          </Form.Item>

          <Form.Item label="Port" name="port" rules={[
            { required: true, message: 'Port is required' },
            { pattern: /^\d+$/, message: 'Enter valid port' }
          ]}>
            <Input placeholder="e.g. 8000" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}