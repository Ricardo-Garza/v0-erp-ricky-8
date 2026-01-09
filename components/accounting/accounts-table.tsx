"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Plus, Eye, Search, FileSpreadsheet, BarChart3 } from "lucide-react"
import type { LedgerAccount } from "@/lib/types"

interface AccountsTableProps {
  ledgerAccounts: LedgerAccount[]
  loading: boolean
  formatCurrency: (value: number) => string
  onNuevaCuenta: () => void
}

export function AccountsTable({ ledgerAccounts, loading, formatCurrency, onNuevaCuenta }: AccountsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredAccounts = (ledgerAccounts || []).filter(
    (acc) =>
      acc.codigo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.nombre?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Catálogo de Cuentas Contables</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => alert("Vista de presupuestos en desarrollo...")}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Ver Presupuestos
              </Button>
              <Button variant="outline" size="sm" onClick={() => alert("Vista de gráficas en desarrollo...")}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Ver Gráficas
              </Button>
              <Button size="sm" onClick={onNuevaCuenta}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Cuenta
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cuenta por código o nombre..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Cargando cuentas...</div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                {searchQuery ? "No se encontraron cuentas" : "Aún no hay cuentas registradas"}
              </h3>
              {!searchQuery && (
                <>
                  <p className="text-muted-foreground mb-4">Comienza agregando tu primera cuenta contable</p>
                  <Button onClick={onNuevaCuenta}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Cuenta
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Código</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Nombre</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Tipo</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Saldo</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Movimientos</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((account) => (
                    <tr key={account.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-2 text-sm font-mono font-medium">{account.codigo}</td>
                      <td className="py-3 px-2 text-sm" style={{ paddingLeft: `${(account.nivel || 1) * 12}px` }}>
                        <span
                          className={
                            (account.nivel || 1) === 1 ? "font-bold" : (account.nivel || 1) === 2 ? "font-semibold" : ""
                          }
                        >
                          {account.nombre}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm">
                        <Badge variant="outline">{account.tipo}</Badge>
                      </td>
                      <td className="py-3 px-2 text-sm font-semibold text-right">
                        {formatCurrency(account.saldo || 0)}
                      </td>
                      <td className="py-3 px-2 text-sm text-center text-muted-foreground">
                        {account.movimientos || 0}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Button variant="ghost" size="sm" onClick={() => alert(`Detalle de cuenta en desarrollo...`)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
