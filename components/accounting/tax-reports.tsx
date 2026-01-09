"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TaxReportsProps {
  formatCurrency: (value: number) => string
}

export function TaxReports({ formatCurrency }: TaxReportsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">IVA Trasladado</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">IVA Acreditable</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">IVA por Pagar</p>
            <p className="text-2xl font-bold mt-1 text-red-600">{formatCurrency(0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">IEPS del Período</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(0)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cálculo Automático de Impuestos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Los impuestos se calcularán automáticamente desde las facturas y transacciones registradas</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
