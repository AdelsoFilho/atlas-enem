import { DailyWritingChallenge } from "@/features/daily-writing/DailyWritingChallenge"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function DailyWritingPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 flex items-center gap-2 font-mono text-xs text-muted hover:text-white transition-colors"
      >
        <ArrowLeft className="h-3 w-3" />
        Voltar ao Dashboard
      </Link>
      <DailyWritingChallenge />
    </main>
  )
}
