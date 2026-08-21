import { getAnalytics } from "@/actions/analytics-actions"
import ProgressClient from "./progress-client"

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const analyticsData = await getAnalytics()

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 flex flex-col pt-10 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <div className="flex flex-col items-center justify-center text-center space-y-3 mb-10">
          <h2 className="text-3xl font-semibold">Progress & Analytics</h2>
          <p className="text-muted-foreground max-w-xl">
            Track your mastery, pinpoint weaknesses, and review test history.
          </p>
        </div>
        
        <ProgressClient data={analyticsData} />
      </div>
    </div>
  )
}
