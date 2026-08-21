import { supabase } from "@/lib/supabase"
import { getUserBookmarks } from "@/actions/bookmark-actions"
import ExploreClient from "@/app/explore/explore-client"

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const bookmarkIds = await getUserBookmarks()

  let questions: any[] = []
  
  if (bookmarkIds.length > 0) {
    const { data } = await supabase
      .from("canonical_questions")
      .select("*")
      .in("question_id", bookmarkIds)
      .order("year", { ascending: false })
      
    questions = data || []
  }

  // Fetch unique subjects, topics, and years for filters based on bookmarked questions
  const uniqueSubjects = Array.from(new Set(questions.map(q => q.subject)))
  const uniqueTopics = Array.from(new Set(questions.map(q => q.topic_tag)))
  const uniqueYears = Array.from(new Set(questions.map(q => q.year))).sort((a, b) => b - a)

  const topicsBySubject: Record<string, string[]> = {}
  questions.forEach(q => {
    if (q.subject && q.topic_tag) {
      if (!topicsBySubject[q.subject]) topicsBySubject[q.subject] = []
      if (!topicsBySubject[q.subject].includes(q.topic_tag)) {
        topicsBySubject[q.subject].push(q.topic_tag)
      }
    }
  })

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 flex flex-col pt-10 px-4 md:px-8">
        <div className="flex flex-col items-center justify-center text-center space-y-3 mb-10">
          <h2 className="text-3xl font-semibold">Bookmarks</h2>
          <p className="text-muted-foreground">
            Review your saved PYQs.
          </p>
        </div>
        
        <ExploreClient 
          initialQuestions={questions} 
          subjects={uniqueSubjects}
          topics={uniqueTopics}
          years={uniqueYears}
          topicsBySubject={topicsBySubject}
          bookmarkedSet={new Set(bookmarkIds)}
        />
      </div>
    </div>
  )
}
