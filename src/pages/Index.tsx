import { Navbar } from "@/components/Navbar";
import { BalanceCards } from "@/components/dashboard/BalanceCards";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { BudgetOverview } from "@/components/dashboard/BudgetOverview";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { GoalsWidget } from "@/components/dashboard/GoalsWidget";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, Alex! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's your financial overview for January 2025
          </p>
        </div>

        {/* Balance Cards */}
        <div className="mb-8">
          <BalanceCards />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Transactions & Budgets */}
          <div className="lg:col-span-2 space-y-6">
            <RecentTransactions />
            <SpendingChart />
          </div>
          
          {/* Right Column - Sidebar Widgets */}
          <div className="space-y-6">
            <BudgetOverview />
            <GoalsWidget />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
