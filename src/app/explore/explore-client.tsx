"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QuestionCard } from "@/components/question-card"
import { Search } from "lucide-react"

interface ExploreClientProps {
  initialQuestions: any[]
  subjects: string[]
  topics: string[]
  years: number[]
  topicsBySubject: Record<string, string[]>
  bookmarkedSet?: Set<string>
}

export default function ExploreClient({ initialQuestions, subjects, topics, years, topicsBySubject, bookmarkedSet }: ExploreClientProps) {
  const [questions, setQuestions] = useState(initialQuestions)
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [topicFilter, setTopicFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")

  const filteredTopics = (subjectFilter && subjectFilter !== "all" && topicsBySubject[subjectFilter])
    ? topicsBySubject[subjectFilter]
    : topics;

  // Client-side filtering for MVP (since dataset is small initially, but should move to server-side for large DBs)
  const filteredQuestions = questions.filter((q: any) => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = subjectFilter === "all" || q.subject === subjectFilter
    const matchesTopic = topicFilter === "all" || q.topic_tag === topicFilter
    const matchesYear = yearFilter === "all" || q.year.toString() === yearFilter
    
    return matchesSearch && matchesSubject && matchesTopic && matchesYear
  })

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4">
        <div className="relative w-full max-w-2xl mx-auto shadow-sm">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search questions..."
            className="pl-12 pr-4 py-6 rounded-2xl bg-white dark:bg-[#212121] border-border text-base focus-visible:ring-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Select value={subjectFilter} onValueChange={(val) => { if(val) { setSubjectFilter(val); setTopicFilter("all"); } }}>
            <SelectTrigger className="w-full sm:w-[140px] rounded-full bg-secondary/20 border-transparent">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((s: string) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={topicFilter} onValueChange={(val) => { if(val) setTopicFilter(val) }}>
            <SelectTrigger className="w-full sm:w-[140px] rounded-full bg-secondary/20 border-transparent">
              <SelectValue placeholder="Topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              {filteredTopics.map((t: string) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={(val) => { if(val) setYearFilter(val) }}>
            <SelectTrigger className="w-auto min-w-[120px] rounded-full h-9 bg-transparent border-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((y: number) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-6 max-w-3xl mx-auto">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No questions found matching your filters.
          </div>
        ) : (
          filteredQuestions.map((q: any) => (
            <QuestionCard 
              key={q.question_id} 
              question={q} 
              mode="explore" 
              initialBookmarked={bookmarkedSet?.has(q.question_id) ?? false}
            />
          ))
        )}
      </div>
    </div>
  )
}
