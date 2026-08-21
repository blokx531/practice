"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { checkAvailability, generateTest, getMetadata } from "@/actions/test-actions"
export default function Dashboard() {
  const router = useRouter()
  const [mode, setMode] = useState("simulation")
  
  const [year, setYear] = useState("mixed")
  const [subject, setSubject] = useState("all")
  const [topic, setTopic] = useState("all")
  const [count, setCount] = useState(20)
  const [timerEnabled, setTimerEnabled] = useState(false)

  const [availableCount, setAvailableCount] = useState<number | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Fetch unique subjects/topics for dropdowns
  const [subjectsList, setSubjectsList] = useState<string[]>([])
  const [topicsList, setTopicsList] = useState<string[]>([])
  const [yearsList, setYearsList] = useState<string[]>([])
  const [topicsBySubjectMap, setTopicsBySubjectMap] = useState<Record<string, string[]>>({})

  useEffect(() => {
    async function fetchMetadata() {
      const { subjects, topics, years, topicsBySubject } = await getMetadata()
      setSubjectsList(subjects)
      setTopicsList(topics)
      setYearsList(years)
      setTopicsBySubjectMap(topicsBySubject)
    }
    fetchMetadata()
  }, [])

  const filteredTopics = (subject && subject !== "all" && topicsBySubjectMap[subject]) 
    ? topicsBySubjectMap[subject] 
    : topicsList

  useEffect(() => {
    async function check() {
      const requestedCount = mode === "simulation" ? 100 : count;
      const actualYear = mode === "simulation" ? year : (mode === "practice" ? year : "all");
      const actualSubject = mode === "simulation" ? "all" : subject;
      const actualTopic = (mode === "simulation" || mode === "practice") ? "all" : topic;

      const available = await checkAvailability({
        mode,
        year: actualYear,
        subject: actualSubject,
        topic: actualTopic
      })
      setAvailableCount(available)
    }
    check()
  }, [mode, year, subject, topic, count])

  const handleStart = async () => {
    setIsGenerating(true)
    try {
      const requestedCount = mode === "simulation" ? 100 : count;
      const actualYear = mode === "simulation" ? year : (mode === "practice" ? year : "all");
      const actualSubject = mode === "simulation" ? "all" : subject;
      const actualTopic = (mode === "simulation" || mode === "practice") ? "all" : topic;

      const testId = await generateTest({
        mode,
        year: actualYear,
        subject: actualSubject,
        topic: actualTopic,
        count: requestedCount,
        timerEnabled: mode === "practice" ? timerEnabled : true
      })
      
      router.push(`/test/${testId}`)
    } catch (e: any) {
      console.error(e)
      alert("Failed to generate test. Error: " + (e?.message || JSON.stringify(e) || "Unknown error"))
    } finally {
      setIsGenerating(false)
    }
  }

  const requestedCount = mode === "simulation" ? 100 : count;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">
          Revision is the only strategy
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Master the UPSC CSE Prelims through rigorous PYQ analysis.
        </p>
      </div>

      <div className="w-full space-y-8">
        <div className="flex justify-center">
          <Tabs value={mode} onValueChange={(val) => { if(val) setMode(val) }} className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-3 rounded-full bg-black/5 dark:bg-white/5 p-1 h-12">
              <TabsTrigger value="simulation" className="rounded-full data-[state=active]:shadow-sm">Simulation</TabsTrigger>
              <TabsTrigger value="custom" className="rounded-full data-[state=active]:shadow-sm">Custom</TabsTrigger>
              <TabsTrigger value="practice" className="rounded-full data-[state=active]:shadow-sm">Practice</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="bg-transparent border border-border/50 rounded-3xl p-6 md:p-8 w-full">
          {mode === "simulation" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="year-select" className="text-base font-medium">Select Year</Label>
                <Select value={year} onValueChange={(val) => { if(val) setYear(val) }}>
                  <SelectTrigger id="year-select" className="h-12 rounded-xl text-base">
                    <SelectValue placeholder="Select a year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixed">Mixed (100 random PYQs)</SelectItem>
                    {yearsList.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-muted/30 p-5 rounded-2xl">
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"/> 100 Questions</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"/> 200 Marks</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"/> 2 Hours</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"/> 1/3 Negative Marking</li>
                </ul>
              </div>
            </div>
          )}

          {mode === "custom" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-base font-medium">Subject</Label>
                  <Select value={subject} onValueChange={(val) => { if(val) { setSubject(val); setTopic("all"); } }}>
                    <SelectTrigger className="h-12 rounded-xl text-base">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjectsList.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-medium">Topic</Label>
                  <Select value={topic} onValueChange={(val) => { if(val) setTopic(val) }}>
                    <SelectTrigger className="h-12 rounded-xl text-base">
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Topics</SelectItem>
                      {filteredTopics.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-base font-medium">Number of Questions</Label>
                <Input type="number" value={count} onChange={(e) => setCount(Number(e.target.value))} min={1} max={100} className="h-12 rounded-xl text-base" />
              </div>
              <div className="bg-muted/30 p-5 rounded-2xl flex justify-between text-sm text-muted-foreground font-medium">
                <span>Total: {count * 2} Marks</span>
                <span>Time: {Math.round(count * 1.2)} Minutes</span>
              </div>
            </div>
          )}

          {mode === "practice" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-base font-medium">Subject</Label>
                  <Select value={subject} onValueChange={(val) => { if(val) { setSubject(val); setTopic("all"); } }}>
                    <SelectTrigger className="h-12 rounded-xl text-base">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjectsList.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-medium">Year Range</Label>
                  <Select value={year} onValueChange={(val) => { if(val) setYear(val) }}>
                    <SelectTrigger className="h-12 rounded-xl text-base">
                      <SelectValue placeholder="Select years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">1995 - 2025</SelectItem>
                      <SelectItem value="recent">Last 10 Years</SelectItem>
                      {yearsList.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between border border-border/50 rounded-2xl p-5 bg-muted/10">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Enable Timer</Label>
                  <p className="text-sm text-muted-foreground">Practice with a countdown.</p>
                </div>
                <Switch checked={timerEnabled} onCheckedChange={setTimerEnabled} />
              </div>
            </div>
          )}

          {availableCount !== null && (
             <div className="mt-6 text-sm text-center">
               {availableCount < requestedCount ? (
                  <span className="text-amber-600 font-medium">Only {availableCount} verified PYQs match your filters.</span>
               ) : (
                  <span className="text-muted-foreground">{availableCount} questions available.</span>
               )}
             </div>
          )}

          <div className="pt-6">
            <Button 
              onClick={handleStart} 
              disabled={isGenerating || availableCount === 0}
              className="w-full h-12 rounded-xl text-base font-medium" 
              size="lg"
            >
              {isGenerating ? "Preparing..." : (mode === "practice" ? "Start Practice" : "Start Test")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
