"use client"

import { useState, useEffect } from "react"
import { where } from "firebase/firestore"
import { COLLECTIONS, subscribeToCollection, addItem, updateItem } from "@/lib/firestore"
import type { Employee, PayrollPeriod, PayrollReceipt, AttendanceRecord, VacationRequest } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"

export function usePayrollData() {
  const { user } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [payrollPeriods, setPayrollPeriods] = useState<PayrollPeriod[]>([])
  const [payrollReceipts, setPayrollReceipts] = useState<PayrollReceipt[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>([])
  const [loading, setLoading] = useState(true)

  // Safe defaults to prevent undefined errors
  const safeEmployees = Array.isArray(employees) ? employees : []
  const safePayrollPeriods = Array.isArray(payrollPeriods) ? payrollPeriods : []
  const safePayrollReceipts = Array.isArray(payrollReceipts) ? payrollReceipts : []
  const safeAttendanceRecords = Array.isArray(attendanceRecords) ? attendanceRecords : []
  const safeVacationRequests = Array.isArray(vacationRequests) ? vacationRequests : []

  const companyId = user?.companyId || ""
  const userId = user?.uid || ""

  useEffect(() => {
    if (!companyId) {
      setLoading(false)
      return
    }

    setLoading(true)

    const unsubscribers = [
      subscribeToCollection<Employee>(COLLECTIONS.employees, (data) => setEmployees(data), [
        where("companyId", "==", companyId),
      ]),
      subscribeToCollection<PayrollPeriod>(COLLECTIONS.payrollPeriods, (data) => setPayrollPeriods(data), [
        where("companyId", "==", companyId),
      ]),
      subscribeToCollection<PayrollReceipt>(COLLECTIONS.payrollReceipts, (data) => setPayrollReceipts(data), [
        where("companyId", "==", companyId),
      ]),
      subscribeToCollection<AttendanceRecord>(COLLECTIONS.attendanceRecords, (data) => setAttendanceRecords(data), [
        where("companyId", "==", companyId),
      ]),
      subscribeToCollection<VacationRequest>(COLLECTIONS.vacationRequests, (data) => setVacationRequests(data), [
        where("companyId", "==", companyId),
      ]),
    ]

    setLoading(false)

    return () => {
      unsubscribers.forEach((unsub) => unsub())
    }
  }, [companyId])

  // KPIs
  const empleadosActivos = safeEmployees.filter((e) => e.estado === "activo").length
  const totalNominaActual = safePayrollPeriods
    .filter((p) => p.estado === "autorizada" || p.estado === "pagada")
    .reduce((sum, p) => sum + (p.totalNomina || 0), 0)
  const vacacionesPendientes = safeVacationRequests.filter((v) => v.estado === "pendiente").length
  const incidenciasDelMes = safeAttendanceRecords.filter(
    (a) => a.tipo !== "normal" && new Date(a.fecha as string).getMonth() === new Date().getMonth(),
  ).length

  const addEmployee = async (employee: Omit<Employee, "id">) => {
    return await addItem<Employee>(COLLECTIONS.employees, {
      ...employee,
      companyId,
      userId,
      estado: employee.estado || "activo",
    })
  }

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    return await updateItem<Employee>(COLLECTIONS.employees, id, updates)
  }

  const addPayrollPeriod = async (period: Omit<PayrollPeriod, "id">) => {
    return await addItem<PayrollPeriod>(COLLECTIONS.payrollPeriods, {
      ...period,
      companyId,
      userId,
      estado: period.estado || "borrador",
      totalNomina: period.totalNomina || 0,
      totalPercepciones: period.totalPercepciones || 0,
      totalDeducciones: period.totalDeducciones || 0,
      totalEmpleados: period.totalEmpleados || 0,
    })
  }

  const updatePayrollPeriod = async (id: string, updates: Partial<PayrollPeriod>) => {
    return await updateItem<PayrollPeriod>(COLLECTIONS.payrollPeriods, id, updates)
  }

  const addVacationRequest = async (request: Omit<VacationRequest, "id">) => {
    return await addItem<VacationRequest>(COLLECTIONS.vacationRequests, {
      ...request,
      companyId,
      userId,
      estado: request.estado || "pendiente",
    })
  }

  const approveVacation = async (id: string, approved: boolean, comments?: string) => {
    return await updateItem<VacationRequest>(COLLECTIONS.vacationRequests, id, {
      estado: approved ? "aprobada" : "rechazada",
      aprobadaPor: userId,
      fechaAprobacion: new Date().toISOString(),
      comentarios: comments,
    })
  }

  return {
    employees: safeEmployees,
    payrollPeriods: safePayrollPeriods,
    payrollReceipts: safePayrollReceipts,
    attendanceRecords: safeAttendanceRecords,
    vacationRequests: safeVacationRequests,
    loading,
    empleadosActivos,
    totalNominaActual,
    vacacionesPendientes,
    incidenciasDelMes,
    addEmployee,
    updateEmployee,
    addPayrollPeriod,
    updatePayrollPeriod,
    addVacationRequest,
    approveVacation,
  }
}
