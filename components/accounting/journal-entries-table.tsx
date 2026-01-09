"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Eye, FileSpreadsheet } from "lucide-react"
import type { JournalEntry } from "@/lib/types"

interface JournalEntriesTableProps {
  journalEntries: JournalEntry[]
  loading: boolean
  formatCurrency: (value: number) => string
  onNuevaPoliza: () => void
  polizasDelMes: number
  polizasPendientes: number
}

export function JournalEntriesTable({
  journalEntries,
  loading,
  formatCurrency,
  onNuevaPoliza,
  polizasDelMes,
  polizasPendientes,
}: JournalEntriesTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [tipoFilter, setTipoFilter] = useState("all")
  const [estadoFilter, setEstadoFilter] = useState("all")

  const filteredEntries = (journalEntries || []).filter((entry) => {
    const matchesSearch =
      entry.folio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.concepto?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTipo = tipoFilter === "all" || entry.tipo === tipoFilter
    const matchesEstado = estadoFilter === "all" || entry.estado === estadoFilter
    return matchesSearch && matchesTipo && matchesEstado
  })

  const formatDate = (date: any) => {
    if (!date) return "Sin fecha"
    const d = date instanceof Date ? date : new Date(date)
    return d.toLocaleDateString("es-MX")
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pólizas del Mes</p>
            <p className="text-2xl font-bold mt-1">{polizasDelMes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pendientes de Autorizar</p>
            <p className="text-2xl font-bold mt-1">{polizasPendientes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Plantillas Disponibles</p>
            <p className="text-2xl font-bold mt-1">0</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pólizas Contables</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => alert("Importar desde Excel en desarrollo...")}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Importar desde Excel
              </Button>
              <Button size="sm" onClick={onNuevaPoliza}>
                <FileText className="w-4 h-4 mr-2" />
                Nueva Póliza
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por folio o descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Todos los tipos</option>
                <option value="Diario">Diario</option>
                <option value="Ingresos">Ingresos</option>
                <option value="Egresos">Egresos</option>
                <option value="Ajuste">Ajuste</option>
              </select>
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="autorizada">Autorizada</option>
                <option value="borrador">Borrador</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Cargando pólizas...</div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold text-lg mb-2">
                  {searchQuery || tipoFilter !== "all" || estadoFilter !== "all"
                    ? "No se encontraron pólizas"
                    : "Aún no hay pólizas registradas"}
                </h3>
                {!searchQuery && tipoFilter === "all" && estadoFilter === "all" && (
                  <>
                    <p className="text-muted-foreground mb-4">Comienza registrando tu primera póliza contable</p>
                    <Button onClick={onNuevaPoliza}>
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Póliza
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Folio</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Fecha</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Tipo</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Descripción</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Estado</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Total</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((entry) => (
                      <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-2 text-sm font-mono font-medium">{entry.folio}</td>
                        <td className="py-3 px-2 text-sm">{formatDate(entry.fecha)}</td>
                        <td className="py-3 px-2 text-sm">
                          <Badge variant="outline">{entry.tipo}</Badge>
                        </td>
                        <td className="py-3 px-2 text-sm max-w-xs truncate">{entry.concepto}</td>
                        <td className="py-3 px-2 text-sm">
                          <Badge
                            variant={
                              entry.estado === "autorizada"
                                ? "default"
                                : entry.estado === "cancelada"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {entry.estado === "autorizada"
                              ? "Autorizada"
                              : entry.estado === "cancelada"
                                ? "Cancelada"
                                : "Borrador"}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-sm font-semibold text-right">
                          {formatCurrency(entry.totalCargos || 0)}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Button variant="ghost" size="sm" onClick={() => alert(`Detalle de póliza en desarrollo...`)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
