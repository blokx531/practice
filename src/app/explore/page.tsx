import { supabase } from "@/lib/supabase"
import ExploreClient from "./explore-client"
import { getUserBookmarks } from "@/actions/bookmark-actions"

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  // Fetch initial data on the server
  const { data: questions } = await supabase
    .from("canonical_questions")
    .select("*")
    .order("year", { ascending: false })
    .limit(50)

  const { getMetadata } = await import("@/actions/test-actions")
  const { subjects, topics, years, topicsBySubject } = await getMetadata()

  // Fetch bookmarks
  const bookmarkIds = await getUserBookmarks()

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 flex flex-col pt-10 px-4 md:px-8">
        <div className="flex flex-col items-center justify-center text-center space-y-3 mb-10">
          <h2 className="text-3xl font-semibold">Explore PYQs</h2>
          <p className="text-muted-foreground">
            Browse the canonical database. Filter by year, subject, and topic.
          </p>
        </div>
        
        <ExploreClient 
          initialQuestions={questions || []} 
          subjects={subjects}
          topics={topics}
          years={years.map(y => parseInt(y))}
          topicsBySubject={topicsBySubject}
          bookmarkedSet={new Set(bookmarkIds)}
        />
      </div>
    </div>
  )
}
