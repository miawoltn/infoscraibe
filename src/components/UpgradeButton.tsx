"use client"

import { ArrowRight } from 'lucide-react'
import { Button } from './ui/button'
import { useState } from 'react';
import axios from 'axios';

const UpgradeButton = () => {

    const [loading, setLoading] = useState(false);
    const handleSubscription = async () => {
        try {
          setLoading(true);
          const response = await axios.get('/api/paystack');
          window.location.href = response.data.url;
    
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      }

  return (
    <Button onClick={() => handleSubscription()} className='w-full'>
      Upgrade now <ArrowRight className='h-5 w-5 ml-1.5' />
    </Button>
  )
}

export default UpgradeButton