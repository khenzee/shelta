import { metrics, bars, monthLabels, activity, tasks } from "@/lib/mock-data";
import OverviewClient from "@/components/overview/OverviewClient";

export default function OverviewPage() {
  // In a real app, you would fetch data here from your API

  return (
    <OverviewClient
      metrics={metrics}
      bars={bars}
      monthLabels={monthLabels}
      activity={activity}
      tasks={tasks}
    />
  );
}
