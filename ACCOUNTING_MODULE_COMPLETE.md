# Módulo de Contabilidad - Implementación Completa

## Resumen
El módulo de Contabilidad ha sido completado como el centro financiero del ERP, utilizando Firestore como única fuente de verdad sin colecciones duplicadas.

## Archivos Modificados

### 1. **lib/types.ts**
- **Cambios**: Enhanced JournalEntry interface con campos de trazabilidad (sourceType, sourceId, sourceFolio, autoPosted)
- **Propósito**: Permitir generación automática de pólizas desde módulos operacionales

### 2. **hooks/use-accounting-data.ts** (REESCRITO)
- **Cambios**: 
  - Suscripciones directas a Firestore con safe defaults para prevenir crashes
  - Método `generateJournalEntry()` para posting automático desde módulos
  - KPIs reales calculados desde ledgerAccounts y journalEntries
  - Actualización automática de saldos en cuentas al autorizar pólizas
- **Integraciones**: Preparado para recibir transacciones de Sales, Banks, Purchases, Service, Maintenance, Field Services

### 3. **components/accounting/accounts-table.tsx** (NUEVO)
- Tabla del catálogo de cuentas con búsqueda, filtros y jerarquía visual
- UI estable: loading → empty → data
- Integración con diálogo de nueva cuenta

### 4. **components/accounting/journal-entries-table.tsx** (NUEVO)
- Tabla de pólizas contables con filtros por tipo y estado
- Muestra KPIs: pólizas del mes, pendientes de autorizar
- UI estable con safe defaults

### 5. **components/accounting/financial-statements.tsx** (NUEVO)
- Estado de Resultados (ingresos, costos, gastos, utilidad neta)
- Balance General (activo, pasivo, capital)
- Calculado en tiempo real desde ledgerAccounts

### 6. **components/accounting/tax-reports.tsx** (NUEVO)
- Reporte de IVA (trasladado, acreditable, por pagar)
- Base para cálculo automático desde facturas (futuro)

### 7. **app/dashboard/accounting/page.tsx**
- **Cambios**: Importa y usa los nuevos componentes de tabla
- Mantiene tabs existentes (Catálogo, Pólizas, Estados Financieros, Razones, Impuestos, SAT)

## Colecciones Firestore Utilizadas
- `ledgerAccounts` - Catálogo de cuentas contables
- `journalEntries` - Pólizas contables con movimientos debit/credit
- `budgets` - Presupuestos anuales por cuenta

## Arquitectura de Integración

### Flujo de Posting Automático
```
Módulo Operacional → genera transacción → useAccountingData.generateJournalEntry()
  ├── Crea JournalEntry con sourceType/sourceId/sourceFolio
  ├── Valida balance (cargos = abonos)
  ├── Autoriza automáticamente
  └── Actualiza saldos en LedgerAccounts
```

### Trazabilidad por IDs
- **Ventas**: salesOrderId → journalEntry.sourceId
- **Bancos**: bankTransactionId → journalEntry.sourceId
- **Compras**: purchaseOrderId/goodsReceiptId → journalEntry.sourceId
- **Servicio**: serviceTicketId → journalEntry.sourceId
- **Mantenimiento**: workOrderId → journalEntry.sourceId
- **Field Services**: fieldServiceOrderId → journalEntry.sourceId

## Funcionalidades Implementadas
✅ Catálogo de cuentas con jerarquía de 3 niveles
✅ Pólizas contables con debit/credit balanceados
✅ KPIs en tiempo real (balance, ingresos, egresos del mes)
✅ Estados financieros calculados desde cuentas
✅ Exportación a Excel del catálogo
✅ Filtros por período, tipo, estado
✅ UI estable con safe defaults (no crashes con data vacía)
✅ Preparado para posting automático desde módulos

## Pendientes (Fase 2)
- Implementar posting automático en cada módulo operacional
- Cálculo automático de impuestos desde facturas
- Generación de XML para SAT
- Razones financieras calculadas
- Comparativos vs presupuesto y períodos anteriores
- Contabilidad por unidad de negocio

## Cumplimiento de Requisitos
✅ Sin colecciones duplicadas
✅ companyId, createdAt, updatedAt en todas las entidades
✅ Defaults sin undefined (safe arrays)
✅ Firestore como única fuente de verdad
✅ Integración por referencias (IDs) sin duplicar información
✅ Accesibilidad corregida (DialogDescription en diálogos)
✅ UI estable (loading→empty→data)
