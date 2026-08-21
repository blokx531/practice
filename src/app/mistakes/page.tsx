import { supabase } from "@/lib/supabase"
import MistakesClient from "./mistakes-client"

export const dynamic = "force-dynamic";

const MOCK_USER_ID = "00000000-0000-0000-0000-000000000000"

export default async function MistakesPage() {
  // Fetch question states for the user
  const { data: states } = await supabase
    .from("user_question_states")
    .select("*")
    .eq("user_id", MOCK_USER_ID)

  const mistakes = states?.filter(s => {
    const owed = (s.wrong_count || 0) * 5;
    const remaining = owed - (s.correct_count || 0);
    return remaining > 0;
  }) || [];
  
  const blindGuesses = states?.filter(s => s.last_confidence === 'blind_guess') || [];

  const mistakeIds = mistakes.map(m => m.question_id);
  const blindGuessIds = blindGuesses.map(b => b.question_id);
  
  // Combine all needed IDs to fetch questions in one go
  const allNeededIds = Array.from(new Set([...mistakeIds, ...blindGuessIds]));

  let questions: any[] = []
  if (allNeededIds.length > 0) {
    const { data } = await supabase
      .from("canonical_questions")
      .select("*")
      .in("question_id", allNeededIds)
    questions = data || []
  }

  const questionsMap = Object.fromEntries(questions.map(q => [q.question_id, q]))

  const mistakesData = mistakes.map(m => ({
    ...m,
    question: questionsMap[m.question_id],
    remainingToClear: ((m.wrong_count || 0) * 5) - (m.correct_count || 0)
  })).filter(m => m.question)

  const blindGuessData = blindGuesses.map(b => ({
    ...b,
    question: questionsMap[b.question_id]
  })).filter(b => b.question)

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 flex flex-col pt-10 px-4 md:px-8 max-w-4xl mx-auto w-full">
        <div className="flex flex-col items-center justify-center text-center space-y-3 mb-10">
          <h2 className="text-3xl font-semibold">My Mistakes</h2>
          <p className="text-muted-foreground max-w-xl">
            Questions you've gotten wrong appear here uniquely. Answer them correctly 5 times in practice mode to clear them.
          </p>
        </div>
        
        <MistakesClient 
          mistakes={mistakesData}
          blindGuesses={blindGuessData}
        />
      </div>
    </div>
  )
}
