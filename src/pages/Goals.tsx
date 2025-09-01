import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, Calendar, DollarSign } from "lucide-react";

const goals = [
  {
    id: 1,
    title: "Emergency Fund",
    target: 10000,
    current: 6800,
    deadline: "2025-06-01",
    category: "Savings",
    priority: "high"
  },
  {
    id: 2,
    title: "Vacation to Europe",
    target: 5000,
    current: 2300,
    deadline: "2025-08-15",
    category: "Travel",
    priority: "medium"
  },
  {
    id: 3,
    title: "New Laptop",
    target: 2500,
    current: 1800,
    deadline: "2025-03-01",
    category: "Technology",
    priority: "low"
  },
  {
    id: 4,
    title: "Car Down Payment",
    target: 8000,
    current: 3200,
    deadline: "2025-12-01",
    category: "Transportation",
    priority: "high"
  }
];

const Goals = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Financial Goals</h1>
            <p className="text-muted-foreground">Track your progress towards financial milestones</p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Add New Goal
          </Button>
        </div>

        {/* Summary */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Goals</p>
                  <p className="text-xl font-bold">{goals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Target</p>
                  <p className="text-xl font-bold">${goals.reduce((sum, goal) => sum + goal.target, 0).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-info" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Saved</p>
                  <p className="text-xl font-bold">${goals.reduce((sum, goal) => sum + goal.current, 0).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-warning" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Progress</p>
                  <p className="text-xl font-bold">
                    {Math.round(goals.reduce((sum, goal) => sum + (goal.current / goal.target * 100), 0) / goals.length)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goals Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {goals.map((goal) => {
            const percentage = (goal.current / goal.target) * 100;
            const remaining = goal.target - goal.current;
            const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <Card key={goal.id} className="bg-gradient-card border-border/50 shadow-card hover:shadow-elevated transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={`text-xs ${
                        goal.priority === 'high' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                        goal.priority === 'medium' ? 'bg-warning/10 text-warning border-warning/20' :
                        'bg-success/10 text-success border-success/20'
                      }`}>
                        {goal.priority} priority
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {goal.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-success">
                        ${goal.current.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        of ${goal.target.toLocaleString()} goal
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-primary">
                        {percentage.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${remaining.toLocaleString()} to go
                      </p>
                    </div>
                  </div>
                  
                  <Progress value={percentage} className="h-3" />
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}</span>
                    </div>
                    <span className="text-muted-foreground">
                      Due: {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" className="flex-1">
                      Edit Goal
                    </Button>
                    <Button className="flex-1 bg-gradient-primary hover:opacity-90 text-primary-foreground">
                      Add Money
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Goals;