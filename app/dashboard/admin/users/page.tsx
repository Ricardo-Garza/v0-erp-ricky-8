"use client"

import { useMemo, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useFirestore } from "@/hooks/use-firestore"
import { COLLECTIONS } from "@/lib/firestore"
import { where } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Shield } from "lucide-react"

type UserRole = "admin" | "user"

type UserProfile = {
  id: string
  name?: string
  email?: string
  role?: UserRole
  companyId?: string
  permissions?: string[]
}

const PERMISSIONS = [
  { id: "crm", label: "CRM" },
  { id: "sales", label: "Ventas" },
  { id: "invoicing", label: "Facturacion" },
  { id: "suppliers", label: "Proveedores" },
  { id: "inventory", label: "Inventario" },
  { id: "warehouse", label: "Almacen" },
  { id: "pos", label: "Punto de venta" },
  { id: "production", label: "Produccion" },
  { id: "maintenance", label: "Mantenimiento" },
  { id: "service", label: "Servicio" },
  { id: "calendar", label: "Calendario" },
  { id: "payroll", label: "Nomina / RRHH" },
  { id: "accounting", label: "Contabilidad" },
  { id: "bi", label: "Business Intelligence" },
]

export default function AdminUsersPage() {
  const { user, companyId } = useAuth()
  const [search, setSearch] = useState("")
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const companyFilter = companyId ? [where("companyId", "==", companyId)] : []

  const { items: users, update, loading } = useFirestore<UserProfile>(
    COLLECTIONS.users,
    companyFilter,
    true,
    false,
  )

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return users
    return users.filter((u) => {
      const name = (u.name || "").toLowerCase()
      const email = (u.email || "").toLowerCase()
      return name.includes(term) || email.includes(term)
    })
  }, [users, search])

  const openDialog = (profile: UserProfile) => {
    setEditingUser({
      ...profile,
      role: profile.role === "admin" ? "admin" : "user",
      permissions: Array.isArray(profile.permissions) ? profile.permissions : [],
    })
    setDialogOpen(true)
  }

  const togglePermission = (permissionId: string) => {
    if (!editingUser) return
    const current = editingUser.permissions || []
    const next = current.includes(permissionId)
      ? current.filter((p) => p !== permissionId)
      : [...current, permissionId]
    setEditingUser({ ...editingUser, permissions: next })
  }

  const handleSave = async () => {
    if (!editingUser) return
    await update(editingUser.id, {
      role: editingUser.role || "user",
      permissions: editingUser.permissions || [],
    })
    setDialogOpen(false)
    setEditingUser(null)
  }

  if (!user) {
    return (
      <Card className="border-white/10 bg-white/5 text-white">
        <CardContent className="p-6">Debes iniciar sesion para ver esta pagina.</CardContent>
      </Card>
    )
  }

  if (user.role !== "admin") {
    return (
      <Card className="border-white/10 bg-white/5 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-amber-300" />
            <span>No tienes permiso para administrar usuarios.</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-white/10 text-white">
        <CardHeader className="space-y-4">
          <CardTitle>Usuarios y permisos</CardTitle>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o correo"
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Permisos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5}>Cargando usuarios...</TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>No hay usuarios para mostrar.</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.name || "Usuario"}</TableCell>
                    <TableCell>{profile.email || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={profile.role === "admin" ? "default" : "secondary"}>
                        {profile.role === "admin" ? "Admin" : "Usuario"}
                      </Badge>
                    </TableCell>
                    <TableCell>{(profile.permissions || []).length} permisos</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => openDialog(profile)}>
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input value={editingUser.name || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Correo</Label>
                  <Input value={editingUser.email || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Select
                    value={editingUser.role || "user"}
                    onValueChange={(value) =>
                      setEditingUser({ ...editingUser, role: value as UserRole })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="user">Usuario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Permisos</Label>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {PERMISSIONS.map((perm) => {
                    const checked = (editingUser.permissions || []).includes(perm.id)
                    return (
                      <label
                        key={perm.id}
                        className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
                      >
                        <Checkbox checked={checked} onCheckedChange={() => togglePermission(perm.id)} />
                        <span>{perm.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
