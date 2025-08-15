import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function PagesLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  )
}