import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { TopProducts } from "@/components/dashboard/top-products"
import { RecentOrders } from "@/components/dashboard/recent-orders"

export default function DashboardPage() {
  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950 p-6 text-white shadow-[0_30px_80px_rgba(15,23,42,0.45)] sm:p-8"
      style={{
        backgroundImage:
          "radial-gradient(circle at 18% 12%, rgba(56,189,248,0.25), transparent 45%), radial-gradient(circle at 80% 20%, rgba(14,165,233,0.2), transparent 45%), radial-gradient(circle at 50% 90%, rgba(16,185,129,0.12), transparent 55%), linear-gradient(135deg, rgba(15,23,42,0.98), rgba(7,10,23,0.94))",
      }}
    >
      <div className="absolute -left-24 -top-20 h-48 w-48 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="absolute -right-10 top-24 h-36 w-36 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="absolute bottom-6 left-1/3 h-56 w-56 rounded-full bg-indigo-400/10 blur-[120px]" />

      <div className="relative space-y-6">
        <DashboardStats />

        <div className="grid gap-6 lg:grid-cols-2">
          <SalesChart />
          <TopProducts />
        </div>

        <RecentOrders />
      </div>
    </div>
  )
}
