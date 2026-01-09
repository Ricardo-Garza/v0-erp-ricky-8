"use client"

import { useState, useEffect, useMemo } from "react"
import { where } from "firebase/firestore"
import { COLLECTIONS, subscribeToCollection } from "@/lib/firestore"
import type {
  SalesOrder,
  StockMovement,
  ServiceTicket,
  PurchaseOrder,
  Employee,
  WorkOrder,
  ProductionOrder,
} from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"

export function useBIData() {
  const { user } = useAuth()
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])
  const [serviceTickets, setServiceTickets] = useState<ServiceTicket[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([])
  const [loading, setLoading] = useState(true)

  const companyId = user?.companyId || ""

  useEffect(() => {
    if (!companyId) {
      setLoading(false)
      return
    }

    setLoading(true)

    const unsubscribers = [
      subscribeToCollection<SalesOrder>(COLLECTIONS.salesOrders, (data) => setSalesOrders(data), [
        where("companyId", "==", companyId),
      ]),
      subscribeToCollection<StockMovement>(COLLECTIONS.stockMovements, (data) => setStockMovements(data), [
        where("companyId", "==", companyId),
      ]),
      subscribeToCollection<ServiceTicket>(COLLECTIONS.serviceTickets, (data) => setServiceTickets(data), [
        where("companyId", "==", companyId),
      ]),
      subscribeToCollection<PurchaseOrder>(COLLECTIONS.purchaseOrders, (data) => setPurchaseOrders(data), [
        where("companyId", "==", companyId),
      ]),
      subscribeToCollection<Employee>(COLLECTIONS.employees, (data) => setEmployees(data), [
        where("companyId", "==", companyId),
      ]),
      subscribeToCollection<WorkOrder>(COLLECTIONS.workOrders, (data) => setWorkOrders(data), [
        where("companyId", "==", companyId),
      ]),
      subscribeToCollection<ProductionOrder>(COLLECTIONS.productionOrders, (data) => setProductionOrders(data), [
        where("companyId", "==", companyId),
      ]),
    ]

    setLoading(false)

    return () => {
      unsubscribers.forEach((unsub) => unsub())
    }
  }, [companyId])

  // Analytics computed from existing data
  const analytics = useMemo(() => {
    const safeSalesOrders = Array.isArray(salesOrders) ? salesOrders : []
    const safeStockMovements = Array.isArray(stockMovements) ? stockMovements : []
    const safeServiceTickets = Array.isArray(serviceTickets) ? serviceTickets : []
    const safePurchaseOrders = Array.isArray(purchaseOrders) ? purchaseOrders : []

    // Sales analytics
    const ventasTotales = safeSalesOrders.reduce((sum, order) => sum + (order.total || 0), 0)
    const ventasDelMes = safeSalesOrders
      .filter((order) => {
        const orderDate = new Date(order.fecha as string)
        const now = new Date()
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()
      })
      .reduce((sum, order) => sum + (order.total || 0), 0)

    // Inventory analytics
    const movimientosSalida = safeStockMovements.filter(
      (m) => m.tipo === "salida" || m.tipo === "venta" || m.tipo === "produccion_consumo",
    ).length

    const movimientosEntrada = safeStockMovements.filter(
      (m) => m.tipo === "entrada" || m.tipo === "recepcion_compra" || m.tipo === "produccion_salida",
    ).length

    // Service analytics
    const ticketsAbiertos = safeServiceTickets.filter((t) => t.estado === "abierto" || t.estado === "en_proceso").length

    // Purchase analytics
    const comprasDelMes = safePurchaseOrders
      .filter((order) => {
        const orderDate = new Date(order.fecha as string)
        const now = new Date()
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()
      })
      .reduce((sum, order) => sum + (order.total || 0), 0)

    return {
      ventasTotales,
      ventasDelMes,
      movimientosSalida,
      movimientosEntrada,
      ticketsAbiertos,
      comprasDelMes,
    }
  }, [salesOrders, stockMovements, serviceTickets, purchaseOrders])

  return {
    salesOrders: Array.isArray(salesOrders) ? salesOrders : [],
    stockMovements: Array.isArray(stockMovements) ? stockMovements : [],
    serviceTickets: Array.isArray(serviceTickets) ? serviceTickets : [],
    purchaseOrders: Array.isArray(purchaseOrders) ? purchaseOrders : [],
    employees: Array.isArray(employees) ? employees : [],
    workOrders: Array.isArray(workOrders) ? workOrders : [],
    productionOrders: Array.isArray(productionOrders) ? productionOrders : [],
    loading,
    analytics,
  }
}
