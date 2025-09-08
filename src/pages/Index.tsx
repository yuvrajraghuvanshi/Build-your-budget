import { Navbar } from "@/components/Navbar";
import { BalanceCards } from "@/components/dashboard/BalanceCards";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { BudgetOverview } from "@/components/dashboard/BudgetOverview";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { GoalsWidget } from "@/components/dashboard/GoalsWidget";
import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

const Index = () => {
  const { dashboardData, loading, error } = useDashboard();
 const {profile}= useProfile();
  const { user} = useAuth();
  console.log({user})

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <p>Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <p className="text-expense">Error loading dashboard: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back {user?.user_metadata?.first_name || "User"}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's your financial overview for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Balance Cards */}
        <div className="mb-8">
          <BalanceCards 
            totalBalance={profile?.monthly_income || 0}
            monthlyIncome={dashboardData.monthlyIncome}
            monthlyExpenses={dashboardData.monthlyExpenses}
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Transactions & Budgets */}
          <div className="lg:col-span-2 space-y-6">
            <RecentTransactions profile={profile} transactions={dashboardData.recentTransactions} />
            {/* <SpendingChart 
              monthlySpending={dashboardData.monthlySpending}
              categorySpending={dashboardData.categorySpending}
            /> */}
          </div>
          
          {/* Right Column - Sidebar Widgets */}
          <div className="space-y-6">
            <BudgetOverview budgets={dashboardData.budgetOverview} />
            {/* <GoalsWidget /> */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;