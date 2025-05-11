'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { format, parseISO } from 'date-fns'

interface UsageChartProps {
  data: {
    date: string
    chatCredits: number
    storageCredits: number
  }[]
}

export function UsageChart({ data }: UsageChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    date: format(parseISO(item.date), 'MMM dd'),
    chatCredits: Math.abs(Number(item.chatCredits)),
    storageCredits: Math.abs(Number(item.storageCredits))
  }))

  return (
    <ResponsiveContainer width="100%" height={300} className={'mb-4'}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="chatCredits"
          stroke="#2563eb"
          name="Chat Usage"
        />
        <Line
          type="monotone"
          dataKey="storageCredits"
          stroke="#16a34a"
          name="Storage Usage"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}