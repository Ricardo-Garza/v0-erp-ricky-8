"use client"

import { useState, useEffect } from "react"
import { where } from "firebase/firestore"
import { COLLECTIONS, subscribeToCollection, addItem, updateItem } from "@/lib/firestore"
import type {
  SupplierCatalog,
  PurchaseRequisition,
  RFQ,
  SupplierQuotation,
  ContractAgreement,
  Supplier,
  PurchaseOrder,
} from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"

export function useEProcurementData() {
  const { user } = useAuth()
  const [supplierCatalog, setSupplierCatalog] = useState<SupplierCatalog[]>([])
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>([])
  const [rfqs, setRFQs] = useState<RFQ[]>([])
  const [quotations, setQuotations] = useState<SupplierQuotation[]>([])
  const [contracts, setContracts] = useState<ContractAgreement[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)

  const companyId = user?.companyId || ""
  const userId = user?.uid || ""

  const safeSupplierCatalog = Array.isArray(supplierCatalog) ? supplierCatalog : []
  const safeRequisitions = Array.isArray(requisitions) ? requisitions : []
  const safeRFQs = Array.isArray(rfqs) ? rfqs : []
  const safeQuotations = Array.isArray(quotations) ? quotations : []
  const safeContracts = Array.isArray(contracts) ? contracts : []
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : []
  const safePurchaseOrders = Array.isArray(purchaseOrders) ? purchaseOrders : []

  useEffect(() => {
    if (!companyId) {
      setLoading(false)
      return
    }

    setLoading(true)

    const unsubscribers = [
      subscribeToCollection<SupplierCatalog>(COLLECTIONS.supplierCatalog, (data) => setSupplierCatalog(data), [
        where("companyId", "==", companyId),
      ]),
      subscribeToCollection<PurchaseRequisition>(COLLECTIONS.purchaseRequisitions, (data) => setRequisitions(data), [
        where("companyId", "==", companyId),
      ]),
      subscribeToCollection<RFQ>(COLLECTIONS.rfqs, (data) => setRFQs(data), [where("companyId", "==", companyId)]),
      subscribeToCollection<SupplierQuotation>(COLLECTIONS.supplierQuotations, (data) => setQuotations(data), [
        where("companyId", "==", companyId),
      ]),
      subscribeToCollection<ContractAgreement>(COLLECTIONS.contractAgreements, (data) => setContracts(data), [
        where("companyId", "==", companyId),
      ]),
      subscribeToCollection<Supplier>(COLLECTIONS.suppliers, (data) => setSuppliers(data), [
        where("companyId", "==", companyId),
      ]),
      subscribeToCollection<PurchaseOrder>(COLLECTIONS.purchaseOrders, (data) => setPurchaseOrders(data), [
        where("companyId", "==", companyId),
      ]),
    ]

    setLoading(false)

    return () => {
      unsubscribers.forEach((unsub) => unsub())
    }
  }, [companyId])

  // KPIs
  const requisicionesPendientes = safeRequisitions.filter(
    (r) => r.estado === "enviada" || r.estado === "aprobada",
  ).length
  const rfqsActivas = safeRFQs.filter((r) => r.estado === "publicada").length
  const cotizacionesPorEvaluar = safeQuotations.filter(
    (q) => q.estado === "recibida" || q.estado === "evaluando",
  ).length
  const contratosVigentes = safeContracts.filter((c) => c.estado === "vigente").length

  const createRequisition = async (requisition: Omit<PurchaseRequisition, "id">) => {
    return await addItem<PurchaseRequisition>(COLLECTIONS.purchaseRequisitions, {
      ...requisition,
      companyId,
      userId,
      estado: requisition.estado || "borrador",
      items: requisition.items || [],
      aprobadores: requisition.aprobadores || [],
    })
  }

  const approveRequisition = async (id: string, approved: boolean, comments?: string) => {
    return await updateItem<PurchaseRequisition>(COLLECTIONS.purchaseRequisitions, id, {
      estado: approved ? "aprobada" : "rechazada",
    })
  }

  const createRFQ = async (rfq: Omit<RFQ, "id">) => {
    return await addItem<RFQ>(COLLECTIONS.rfqs, {
      ...rfq,
      companyId,
      userId,
      estado: rfq.estado || "borrador",
      items: rfq.items || [],
      proveedoresInvitados: rfq.proveedoresInvitados || [],
      criteriosEvaluacion: rfq.criteriosEvaluacion || [],
      cotizacionesRecibidas: 0,
    })
  }

  const evaluateQuotation = async (id: string, evaluation: any) => {
    return await updateItem<SupplierQuotation>(COLLECTIONS.supplierQuotations, id, {
      estado: "evaluando",
      evaluacion: evaluation,
    })
  }

  const createContract = async (contract: Omit<ContractAgreement, "id">) => {
    return await addItem<ContractAgreement>(COLLECTIONS.contractAgreements, {
      ...contract,
      companyId,
      userId,
      estado: contract.estado || "borrador",
      productos: contract.productos || [],
      renovacionAutomatica: contract.renovacionAutomatica ?? false,
    })
  }

  return {
    supplierCatalog: safeSupplierCatalog,
    requisitions: safeRequisitions,
    rfqs: safeRFQs,
    quotations: safeQuotations,
    contracts: safeContracts,
    suppliers: safeSuppliers,
    purchaseOrders: safePurchaseOrders,
    loading,
    requisicionesPendientes,
    rfqsActivas,
    cotizacionesPorEvaluar,
    contratosVigentes,
    createRequisition,
    approveRequisition,
    createRFQ,
    evaluateQuotation,
    createContract,
  }
}
