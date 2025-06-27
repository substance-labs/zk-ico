import axios from "axios"
import { useCallback, useState } from "react"

export const useDeployContract = () => {
  const [isDeploying, setIsDeploying] = useState<boolean>(false)
  const [deploymentResult, setDeploymentResult] = useState<any>(null)

  const deployContract = useCallback(async (contractData: any) => {
    try {
      setIsDeploying(true)
      setDeploymentResult(null)

      const apiUrl = process.env.VITE_API_URL
      if (!apiUrl) {
        throw new Error('API URL not configured. Please set VITE_API_URL in your environment variables.')
      }

      const response = await axios.post(`${apiUrl}/api/deploy/contract`, contractData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      setDeploymentResult(response.data)
      return response.data
    } catch (err) {
      console.error('Error deploying contract:', err)
      throw err
    } finally {
      setIsDeploying(false)
    }
  }, [])

  return {
    deployContract,
    isDeploying,
    deploymentResult,
    resetDeployment: () => setDeploymentResult(null),
  }
}