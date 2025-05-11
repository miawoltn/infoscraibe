'use client'

import { useState } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select'
import { BarChart, Clock, CreditCard, AlertCircle } from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import { CREDIT_PACKAGES, PRICING } from '../lib/constants'
import toast from 'react-hot-toast'
import { UsageChart } from './UsageChart'

interface CreditsDashboardProps {
    credits: number
    threshold: number
    usageHistory: {
        date: string
        chatCredits: number
        storageCredits: number
    }[]
}

export function CreditsDashboard({ credits, threshold, usageHistory }: CreditsDashboardProps) {
    const [selectedPackage, setSelectedPackage] = useState('')
    const [customAmount, setCustomAmount] = useState('')
    const [newThreshold, setNewThreshold] = useState(threshold.toString())
    const [isLoading, setIsLoading] = useState(false)

    const handleTopup = async () => {
        try {
            setIsLoading(true)
            const amount = selectedPackage 
                ? CREDIT_PACKAGES.find(p => p.name === selectedPackage)?.price
                : Number(customAmount)

            const response = await fetch('/api/credits/topup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
            })

            console.dir({response}, { depth: null })

            const data = await response.json()
            if(!response.ok) {
                throw new Error(data.message)
            }
            window.location.href = data.paymentUrl
        } catch (error) {
            console.error('Topup error:', error)
            toast.error('Failed to process topup')
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdateThreshold = async () => {
        try {
            setIsLoading(true)
            await fetch('/api/credits/threshold', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ threshold: Number(newThreshold) })
            })
            toast.success('Reminder threshold updated')
        } catch (error) {
            toast.error('Failed to update threshold')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="h-full overflow-y-auto">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 ">
            {/* Credits Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Available Credits</CardTitle>
                    <CardDescription>Your current balance</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(credits)}</div>
                    {credits < threshold && (
                        <p className="text-sm text-red-500 mt-2 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Below reminder threshold
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Topup Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Up Credits</CardTitle>
                    <CardDescription>Purchase more credits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a package" />
                        </SelectTrigger>
                        <SelectContent>
                            {CREDIT_PACKAGES.map(pkg => (
                                <SelectItem key={pkg.name} value={pkg.name}>
                                    {pkg.name} - ₦{formatNumber(pkg.price)} ({formatNumber(pkg.credits)} credits)
                                </SelectItem>
                            ))}
                            <SelectItem value="custom">Custom Amount</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    {selectedPackage === 'custom' && (
                        <Input
                            type="number"
                            placeholder="Enter amount in Naira"
                            value={customAmount}
                            onChange={e => setCustomAmount(e.target.value)}
                            min={PRICING.MIN_TOPUP_AMOUNT}
                        />
                    )}
                </CardContent>
                <CardFooter>
                    <Button 
                        onClick={handleTopup} 
                        disabled={isLoading || (!selectedPackage && !customAmount)}
                        className="w-full"
                    >
                        {isLoading ? 'Processing...' : 'Top Up Now'}
                    </Button>
                </CardFooter>
            </Card>

            {/* Settings Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>Manage your preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Reminder Threshold</label>
                        <Input
                            type="number"
                            value={newThreshold}
                            onChange={e => setNewThreshold(e.target.value)}
                            placeholder="Set reminder threshold"
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button 
                        onClick={handleUpdateThreshold}
                        disabled={isLoading || Number(newThreshold) === threshold}
                        className="w-full"
                    >
                        Update Threshold
                    </Button>
                </CardFooter>
            </Card>

            {/* Usage Chart */}
            <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                    <CardTitle>Usage History</CardTitle>
                    <CardDescription>Your credit usage over time</CardDescription>
                </CardHeader>
                <CardContent>
                    <UsageChart data={usageHistory} />
                </CardContent>
            </Card>
        </div>
      </div>
    )
}