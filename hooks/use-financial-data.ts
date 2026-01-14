"use client"

import { useState, useEffect } from "react"
import { Timestamp, where } from "firebase/firestore"
import { getItems, COLLECTIONS } from "@/lib/firestore"
import type { SalesOrder, Purchase, Expense, InventorySnapshot, InventoryStock, FinancialPeriod } from "@/lib/types"

interface UseFinancialDataOptions {
  periodStart?: Date
  periodEnd?: Date
  useCurrentMonth?: boolean
  companyId?: string
  userId?: string
}

export function useFinancialData(options: UseFinancialDataOptions = {}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<FinancialPeriod>({
    periodStart: new Date(),
    periodEnd: new Date(),
    totalRevenue: 0,
    cogs: 0,
    grossProfit: 0,
    opex: 0,
    operatingProfit: 0,
    operatingMargin: 0,
  })

  useEffect(() => {
    calculateFinancials()
  }, [options.periodStart, options.periodEnd, options.useCurrentMonth])

  const calculateFinancials = async () => {
    setLoading(true)
    setError(null)

    try {
      let periodStart: Date
      let periodEnd: Date

      if (options.periodStart && options.periodEnd) {
        periodStart = options.periodStart
        periodEnd = options.periodEnd
      } else {
        const now = new Date()
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      }

      const constraints = options.companyId
        ? [where("companyId", "==", options.companyId)]
        : options.userId
          ? [where("userId", "==", options.userId)]
          : []

      const allOrders = await getItems<SalesOrder>(COLLECTIONS.salesOrders, constraints)

      const periodOrders = (allOrders || []).filter((order) => {
        if (
          !order.status ||
          !["confirmed", "in_progress", "delivered", "invoiced", "invoiced_partial"].includes(order.status)
        ) {
          return false
        }

        if (!order.orderDate) return false

        const orderDate =
          order.orderDate instanceof Timestamp ? order.orderDate.toDate() : new Date(order.orderDate)
        return orderDate >= periodStart && orderDate <= periodEnd
      })

      const totalRevenue = periodOrders.reduce((sum, order) => sum + (order.total || 0), 0)

      const allPurchases = await getItems<Purchase>(COLLECTIONS.purchases, constraints)

      const periodPurchases = (allPurchases || []).filter((purchase) => {
        if (!purchase.status || purchase.status !== "completed") return false
        if (!purchase.date) return false

        const purchaseDate = purchase.date instanceof Timestamp ? purchase.date.toDate() : new Date(purchase.date)
        return purchaseDate >= periodStart && purchaseDate <= periodEnd
      })

      const totalPurchases = periodPurchases.reduce((sum, purchase) => sum + (purchase.amount || 0), 0)

      const allExpenses = await getItems<Expense>(COLLECTIONS.expenses, constraints)

      const periodExpenses = (allExpenses || []).filter((expense) => {
        if (!expense.status || expense.status !== "paid") return false
        if (!expense.date) return false

        const expenseDate = expense.date instanceof Timestamp ? expense.date.toDate() : new Date(expense.date)
        return expenseDate >= periodStart && expenseDate <= periodEnd
      })

      const totalOpex = periodExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)

      const periodKey = `${periodStart.getFullYear()}-${String(periodStart.getMonth() + 1).padStart(2, "0")}`
      const allSnapshots = await getItems<InventorySnapshot>(COLLECTIONS.inventorySnapshots, constraints)

      const snapshots = (allSnapshots || []).filter((s) => s.period === periodKey)

      let openingInventory = 0
      let closingInventory = 0

      if (snapshots.length > 0) {
        const snapshot = snapshots[0]
        openingInventory = snapshot.openingValue || 0
        closingInventory = snapshot.closingValue || 0
      } else {
        const prevMonth = new Date(periodStart)
        prevMonth.setMonth(prevMonth.getMonth() - 1)
        const prevPeriodKey = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`

        const prevSnapshots = (allSnapshots || []).filter((s) => s.period === prevPeriodKey)

        if (prevSnapshots.length > 0) {
          openingInventory = prevSnapshots[0].closingValue || 0
        }

        const inventory = await getItems<InventoryStock>(COLLECTIONS.inventoryStock, constraints)
        closingInventory = (inventory || []).reduce(
          (sum, item) => sum + (item.cantidadActual || 0) * (item.costoPromedio || 0),
          0,
        )
      }

      const cogs = Math.max(0, openingInventory + totalPurchases - closingInventory)
      const grossProfit = totalRevenue - cogs
      const operatingProfit = grossProfit - totalOpex
      const operatingMargin = totalRevenue > 0 ? (operatingProfit / totalRevenue) * 100 : 0

      setData({
        periodStart,
        periodEnd,
        totalRevenue,
        cogs,
        grossProfit,
        opex: totalOpex,
        operatingProfit,
        operatingMargin,
      })
    } catch (err) {
      console.error("[v0] useFinancialData error:", err)
      const now = new Date()
      setData({
        periodStart: new Date(now.getFullYear(), now.getMonth(), 1),
        periodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
        totalRevenue: 0,
        cogs: 0,
        grossProfit: 0,
        opex: 0,
        operatingProfit: 0,
        operatingMargin: 0,
      })
      setError(err instanceof Error ? err.message : "Error al calcular métricas financieras")
    } finally {
      setLoading(false)
    }
  }

  return {
    data,
    loading,
    error,
    refresh: calculateFinancials,
  }
}
