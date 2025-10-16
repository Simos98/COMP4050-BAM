import { useEffect, useState } from 'react'
import { Card, Table, Button, Modal, Form, Input, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { listDevices, createDevice, type Device } from '../services/devices'
import { useAuth } from '../context/AuthContext'

export default function Devices() {
  const { user } = useAuth()
  const [data, setData] = useState<Device[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  const load = async () => {
    setLoading(true)
    try {
      const rows = await listDevices()
      setData(rows)
    } catch (e) {
      message.error('Failed to load devices')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onCreate = async () => {
    try {
      const values = await form.validateFields()
      await createDevice({ deviceId: values.deviceId.trim(), lab: values.lab.trim() })
      message.success('Device added')
      form.resetFields()
      setOpen(false)
      load()
    } catch (err: any) {
      message.error(err?.message || 'Failed to add device')
    }
  }

  const columns: ColumnsType<Device> = [
    { title: 'Device ID', dataIndex: 'deviceId', key: 'deviceId' },
    { title: 'Lab', dataIndex: 'lab', key: 'lab' },
  ]

  return (
    <Card
      title="Devices"
      extra={
        user?.role === 'admin' ? (
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
        </Form>
      </Modal>
    </Card>
  )
}
