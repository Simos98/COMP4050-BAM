import { useEffect, useState } from 'react'
import { Card, Table, Button, Modal, Form, Input, message, Popconfirm, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { listDevices, createDevice, deleteDevice, type DeviceRecord } from '../services/devices'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Devices() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'
  const [data, setData] = useState<DeviceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  const load = async () => {
    setLoading(true)
    try {
      const rows = await listDevices()
      setData(rows)
    } catch (e: any) {
      if (e?.status === 401) { await logout(); navigate('/login'); return }
      message.error('Failed to load devices')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onCreate = async () => {
    try {
      const values = await form.validateFields()
      await createDevice({
        deviceId: values.deviceId.trim(),
        lab: values.lab.trim(),
        ip: values.ip.trim(),
        port: Number(values.port),
      })
      message.success('Device added')
      form.resetFields()
      setOpen(false)
      load()
    } catch (err: any) {
      if (err?.status === 401) { await logout(); navigate('/login'); return }
      if (err?.status === 403) message.error('Forbidden: admin only')
      else message.error(err?.message || 'Failed to add device')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDevice(id)
      message.success('Device removed')
      load()
    } catch (err: any) {
      if (err?.status === 401) { await logout(); navigate('/login'); return }
      if (err?.status === 403) message.error('Forbidden: admin only')
      else if (err?.status === 404) message.error('Device not found')
      else message.error('Failed to delete device')
    }
  }

  const columns: ColumnsType<DeviceRecord> = [
    { title: 'Device ID', dataIndex: 'deviceId', key: 'deviceId' },
    { title: 'Lab', dataIndex: 'lab', key: 'lab' },
    { title: 'IP', dataIndex: 'ip', key: 'ip', render: (v) => v ?? '—' },
    { title: 'Port', dataIndex: 'port', key: 'port', render: (v) => v ?? '—' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {isAdmin ? (
            <Popconfirm title="Delete device?" onConfirm={() => handleDelete(record.id)}>
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

      <Modal title="Add Device" open={open} onOk={onCreate} onCancel={() => { setOpen(false); form.resetFields() }} okText="Add">
        <Form layout="vertical" form={form}>
          <Form.Item label="Device ID" name="deviceId" rules={[{ required: true, message: 'Enter device id' }]}>
            <Input placeholder="e.g. B-001" />
          </Form.Item>

          <Form.Item label="Lab" name="lab" rules={[{ required: true, message: 'Enter lab name or number' }]}>
            <Input placeholder="e.g. Lab 1" />
          </Form.Item>

          <Form.Item label="IP Address" name="ip" rules={[
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
    </Card>
  )
}
