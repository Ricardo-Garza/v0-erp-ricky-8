"use client"

import { useState, useEffect } from "react"
import { where } from "firebase/firestore"
import { COLLECTIONS, subscribeToCollection, addItem, updateItem } from "@/lib/firestore"
import type { EcommerceProduct, EcommerceOrder, ProductReview, Promotion } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"

export function useEcommerceData() {
  const { user } = useAuth()
  const [products, setProducts] = useState<EcommerceProduct[]>([])
  const [orders, setOrders] = useState<EcommerceOrder[]>([])
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)

  const companyId = user?.companyId || ""
  const userId = user?.uid || ""

  const safeProducts = Array.isArray(products) ? products : []
  const safeOrders = Array.isArray(orders) ? orders : []
  const safeReviews = Array.isArray(reviews) ? reviews : []
  const safePromotions = Array.isArray(promotions) ? promotions : []

  useEffect(() => {
    if (!companyId) {
      setLoading(false)
      return
    }

    setLoading(true)

    const unsubscribers = [
      subscribeToCollection<EcommerceProduct>(COLLECTIONS.ecommerceProducts, (data) => setProducts(data), [
        where("companyId", "==", companyId),
      ]),
      subscribeToCollection<EcommerceOrder>(COLLECTIONS.ecommerceOrders, (data) => setOrders(data), [
        where("companyId", "==", companyId),
      ]),
      subscribeToCollection<ProductReview>(COLLECTIONS.productReviews, (data) => setReviews(data), [
        where("companyId", "==", companyId),
      ]),
      subscribeToCollection<Promotion>(COLLECTIONS.promotions, (data) => setPromotions(data), [
        where("companyId", "==", companyId),
      ]),
    ]

    setLoading(false)

    return () => {
      unsubscribers.forEach((unsub) => unsub())
    }
  }, [companyId])

  // KPIs
  const productosPublicados = safeProducts.filter((p) => p.publicado).length
  const ordenesPendientes = safeOrders.filter(
    (o) => o.estadoPedido === "pendiente" || o.estadoPedido === "confirmado",
  ).length
  const ventasDelMes = safeOrders
    .filter((o) => {
      const orderDate = new Date(o.fechaPedido as string)
      const now = new Date()
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, o) => sum + (o.total || 0), 0)
  const reviewsPendientes = safeReviews.filter((r) => r.estado === "pendiente").length

  const publishProduct = async (product: Omit<EcommerceProduct, "id">) => {
    return await addItem<EcommerceProduct>(COLLECTIONS.ecommerceProducts, {
      ...product,
      companyId,
      userId,
      publicado: product.publicado ?? true,
      disponible: product.disponible ?? true,
      destacado: product.destacado ?? false,
      calificacionPromedio: 0,
      numeroReviews: 0,
      imagenes: product.imagenes || [],
      etiquetas: product.etiquetas || [],
    })
  }

  const updateProduct = async (id: string, updates: Partial<EcommerceProduct>) => {
    return await updateItem<EcommerceProduct>(COLLECTIONS.ecommerceProducts, id, updates)
  }

  const updateOrderStatus = async (
    id: string,
    estadoPedido: EcommerceOrder["estadoPedido"],
    estadoPago?: EcommerceOrder["estadoPago"],
  ) => {
    const updates: Partial<EcommerceOrder> = { estadoPedido }
    if (estadoPago) updates.estadoPago = estadoPago
    if (estadoPedido === "enviado") updates.fechaEnvio = new Date().toISOString()
    if (estadoPedido === "entregado") updates.fechaEntrega = new Date().toISOString()
    return await updateItem<EcommerceOrder>(COLLECTIONS.ecommerceOrders, id, updates)
  }

  const approveReview = async (id: string, approved: boolean) => {
    return await updateItem<ProductReview>(COLLECTIONS.productReviews, id, {
      estado: approved ? "aprobado" : "rechazado",
    })
  }

  return {
    products: safeProducts,
    orders: safeOrders,
    reviews: safeReviews,
    promotions: safePromotions,
    loading,
    productosPublicados,
    ordenesPendientes,
    ventasDelMes,
    reviewsPendientes,
    publishProduct,
    updateProduct,
    updateOrderStatus,
    approveReview,
  }
}
