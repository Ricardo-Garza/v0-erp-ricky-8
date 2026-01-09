"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Calculator, PieChart, FileSpreadsheet } from "lucide-react"
import type { LedgerAccount } from "@/lib/types"

interface FinancialStatementsProps {
  ledgerAccounts: LedgerAccount[]
  loading: boolean
  formatCurrency: (value: number) => string
}

export function FinancialStatements({ ledgerAccounts, loading, formatCurrency }: FinancialStatementsProps) {
  const safeAccounts = Array.isArray(ledgerAccounts) ? ledgerAccounts : []

  const activoCuentas = safeAccounts.filter((acc) => acc.tipo === "Activo" && acc.acumulaSaldo)
  const pasivoCuentas = safeAccounts.filter((acc) => acc.tipo === "Pasivo" && acc.acumulaSaldo)
  const capitalCuentas = safeAccounts.filter((acc) => acc.tipo === "Capital" && acc.acumulaSaldo)
  const ingresosCuentas = safeAccounts.filter((acc) => acc.tipo === "Ingresos" && acc.acumulaSaldo)
  const egresosCuentas = safeAccounts.filter((acc) => acc.tipo === "Egresos" && acc.acumulaSaldo)
  const costosCuentas = safeAccounts.filter((acc) => acc.tipo === "Costos" && acc.acumulaSaldo)

  const totalActivo = activoCuentas.reduce((sum, acc) => sum + (acc.saldo || 0), 0)
  const totalPasivo = pasivoCuentas.reduce((sum, acc) => sum + (acc.saldo || 0), 0)
  const totalCapital = capitalCuentas.reduce((sum, acc) => sum + (acc.saldo || 0), 0)
  const totalIngresos = ingresosCuentas.reduce((sum, acc) => sum + (acc.saldo || 0), 0)
  const totalCostos = costosCuentas.reduce((sum, acc) => sum + (acc.saldo || 0), 0)
  const totalEgresos = egresosCuentas.reduce((sum, acc) => sum + (acc.saldo || 0), 0)

  const utilidadBruta = totalIngresos - totalCostos
  const utilidadNeta = utilidadBruta - totalEgresos

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Calculando estados financieros...</p>
      </div>
    )
  }

  if (safeAccounts.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="font-semibold text-lg mb-2">No hay datos para mostrar</h3>
        <p className="text-muted-foreground">Configura tu catálogo de cuentas para ver los estados financieros</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Estado de Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-semibold">Ingresos</span>
                <span className="font-bold text-green-600">{formatCurrency(totalIngresos)}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-semibold">Costo de Ventas</span>
                <span className="font-bold text-red-600">{formatCurrency(totalCostos)}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b bg-muted/50">
                <span className="font-semibold">Utilidad Bruta</span>
                <span className="font-bold">{formatCurrency(utilidadBruta)}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-semibold">Gastos de Operación</span>
                <span className="font-bold text-red-600">{formatCurrency(totalEgresos)}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b bg-primary/10">
                <span className="font-bold">Utilidad Neta</span>
                <span className="font-bold text-primary text-lg">{formatCurrency(utilidadNeta)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Balance General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-semibold">ACTIVO</span>
                <span className="font-bold">{formatCurrency(totalActivo)}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-semibold">PASIVO</span>
                <span className="font-bold">{formatCurrency(totalPasivo)}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-semibold">CAPITAL</span>
                <span className="font-bold">{formatCurrency(totalCapital)}</span>
              </div>

              <div className="flex justify-between items-center py-2 bg-muted/50 rounded">
                <span className="font-bold">PASIVO + CAPITAL</span>
                <span className="font-bold">{formatCurrency(totalPasivo + totalCapital)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Opciones de Visualización</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="justify-start bg-transparent"
              onClick={() => alert("Estados a 12 meses en desarrollo...")}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Estados a 12 Meses
            </Button>
            <Button
              variant="outline"
              className="justify-start bg-transparent"
              onClick={() => alert("Por unidad de negocio en desarrollo...")}
            >
              <Calculator className="w-4 h-4 mr-2" />
              Por Unidad de Negocio
            </Button>
            <Button
              variant="outline"
              className="justify-start bg-transparent"
              onClick={() => alert("Comparativo vs período en desarrollo...")}
            >
              <PieChart className="w-4 h-4 mr-2" />
              Comparativo vs Período
            </Button>
            <Button
              variant="outline"
              className="justify-start bg-transparent"
              onClick={() => alert("vs Presupuestado en desarrollo...")}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              vs Presupuestado
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
