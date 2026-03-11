import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  Dumbbell,
  Flame,
  MessageSquarePlus,
  Star,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Review } from "./backend";
import {
  Category,
  useGetAllReviews,
  useSubmitReview,
} from "./hooks/useQueries";

// ---------------------------------------------------------------------------
// Sample reviews shown while real data loads or when canister is empty
// ---------------------------------------------------------------------------
const SAMPLE_REVIEWS: Review[] = [
  {
    author: "Marcus T.",
    rating: 5,
    category: Category.trainers,
    opinion:
      "Coach Rhea completely transformed my deadlift form in just two sessions. Her cues are sharp and she actually watches you lift instead of checking her phone.",
    timestamp: BigInt(Date.now() - 2 * 24 * 3600 * 1000) * BigInt(1_000_000),
  },
  {
    author: "Priya K.",
    rating: 4,
    category: Category.equipment,
    opinion:
      "Love that they just got the new Rogue rack setup. Plates are always available even during peak hours, which is rare for a busy gym.",
    timestamp: BigInt(Date.now() - 5 * 24 * 3600 * 1000) * BigInt(1_000_000),
  },
  {
    author: "Jordan M.",
    rating: 5,
    category: Category.atmosphere,
    opinion:
      "No ego, no judgment — just people grinding. Someone spotted me on bench press and gave genuinely helpful tips. This place has real culture.",
    timestamp: BigInt(Date.now() - 9 * 24 * 3600 * 1000) * BigInt(1_000_000),
  },
  {
    author: "Sam W.",
    rating: 4,
    category: Category.cleanliness,
    opinion:
      "Showers are cleaned twice daily and I've never seen a machine without wipes nearby. Rare for a gym this busy.",
    timestamp: BigInt(Date.now() - 14 * 24 * 3600 * 1000) * BigInt(1_000_000),
  },
  {
    author: "Leila R.",
    rating: 5,
    category: Category.classes,
    opinion:
      "The Saturday HIIT class with Darnell is absolutely brutal and I love every second of it. The energy in that room is unmatched.",
    timestamp: BigInt(Date.now() - 21 * 24 * 3600 * 1000) * BigInt(1_000_000),
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function timeAgo(nanoseconds: bigint): string {
  const ms = Number(nanoseconds / BigInt(1_000_000));
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function categoryLabel(cat: Category): string {
  const map: Record<Category, string> = {
    [Category.trainers]: "Trainers",
    [Category.equipment]: "Equipment",
    [Category.atmosphere]: "Atmosphere",
    [Category.cleanliness]: "Cleanliness",
    [Category.classes]: "Classes",
  };
  return map[cat] ?? cat;
}

const CATEGORIES: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: Category.trainers, label: "Trainers" },
  { value: Category.equipment, label: "Equipment" },
  { value: Category.atmosphere, label: "Atmosphere" },
  { value: Category.cleanliness, label: "Cleanliness" },
  { value: Category.classes, label: "Classes" },
];

// ---------------------------------------------------------------------------
// StarDisplay
// ---------------------------------------------------------------------------
function StarDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= rating ? "star-filled fill-current" : "star-empty"}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// StarPicker
// ---------------------------------------------------------------------------
function StarPicker({
  value,
  onChange,
}: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= (hover || value);
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              size={28}
              className={filled ? "star-filled fill-current" : "star-empty"}
            />
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ReviewCard
// ---------------------------------------------------------------------------
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function ReviewCard({ review, index }: { review: Review; index: number }) {
  const ocidIndex = index + 1;
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      data-ocid={`review.item.${ocidIndex}`}
      className="relative rounded-lg border border-border bg-card p-5 flex flex-col gap-3 hover:border-primary/40 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center font-display font-bold text-sm text-foreground shrink-0">
            {review.author.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-display font-semibold text-sm text-foreground leading-tight">
              {review.author}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {timeAgo(review.timestamp)}
            </p>
          </div>
        </div>
        <StarDisplay rating={review.rating} size={14} />
      </div>

      {/* Badge */}
      <Badge
        variant="outline"
        className={`badge-${review.category} w-fit text-xs font-medium px-2 py-0.5`}
      >
        {categoryLabel(review.category)}
      </Badge>

      {/* Opinion */}
      <p className="text-sm text-foreground/85 leading-relaxed">
        {review.opinion}
      </p>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Submit Review Dialog
// ---------------------------------------------------------------------------
function SubmitReviewDialog() {
  const [open, setOpen] = useState(false);
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState<Category | "">("");
  const [opinion, setOpinion] = useState("");
  const submit = useSubmitReview();

  function reset() {
    setAuthor("");
    setRating(0);
    setCategory("");
    setOpinion("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!author.trim() || rating === 0 || !category || !opinion.trim()) {
      toast.error("Please fill in all fields and pick a star rating.");
      return;
    }
    try {
      await submit.mutateAsync({
        author: author.trim(),
        rating,
        category: category as Category,
        opinion: opinion.trim(),
      });
      toast.success("Your opinion has been posted!");
      reset();
      setOpen(false);
    } catch {
      toast.error("Failed to post. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          data-ocid="submit.open_modal_button"
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-display font-bold tracking-wide animate-pulse-glow gap-2"
        >
          <MessageSquarePlus size={18} />
          Share Your Opinion
        </Button>
      </DialogTrigger>

      <DialogContent
        data-ocid="submit.dialog"
        className="bg-card border-border sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold text-foreground">
            Share Your Experience
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="author" className="text-sm text-muted-foreground">
              Your Name
            </Label>
            <Input
              id="author"
              data-ocid="submit.input"
              placeholder="e.g. Marcus T."
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="bg-secondary border-border focus:border-primary"
            />
          </div>

          {/* Star Rating */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-muted-foreground">Rating</Label>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-muted-foreground">Category</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as Category)}
            >
              <SelectTrigger
                data-ocid="submit.select"
                className="bg-secondary border-border"
              >
                <SelectValue placeholder="Pick a category" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {CATEGORIES.filter((c) => c.value !== "all").map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Opinion */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="opinion" className="text-sm text-muted-foreground">
              Your Opinion
            </Label>
            <Textarea
              id="opinion"
              data-ocid="submit.textarea"
              placeholder="Tell other members what you think..."
              value={opinion}
              onChange={(e) => setOpinion(e.target.value)}
              rows={4}
              className="bg-secondary border-border focus:border-primary resize-none"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="submit.cancel_button"
              onClick={() => {
                reset();
                setOpen(false);
              }}
              className="border-border text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="submit.submit_button"
              disabled={submit.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold"
            >
              {submit.isPending ? "Posting..." : "Post Opinion"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main App
// ---------------------------------------------------------------------------
export default function App() {
  const [activeFilter, setActiveFilter] = useState("all");
  const { data: liveReviews, isLoading, isError } = useGetAllReviews();

  // Use live reviews when available and non-empty, else sample reviews
  const allReviews = useMemo(() => {
    if (!isLoading && liveReviews && liveReviews.length > 0) return liveReviews;
    return SAMPLE_REVIEWS;
  }, [liveReviews, isLoading]);

  const filtered = useMemo(() => {
    if (activeFilter === "all") return allReviews;
    return allReviews.filter((r) => r.category === activeFilter);
  }, [allReviews, activeFilter]);

  const avgRating = useMemo(() => {
    if (allReviews.length === 0) return 0;
    return allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  }, [allReviews]);

  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster position="top-right" theme="dark" />

      {/* ------------------------------------------------------------------ */}
      {/* HERO */}
      {/* ------------------------------------------------------------------ */}
      <section
        data-ocid="hero.section"
        className="relative overflow-hidden hero-clip"
        style={{ minHeight: "520px" }}
      >
        {/* Background image */}
        <img
          src="/assets/generated/gym-hero.dim_1400x700.jpg"
          alt="Gym interior"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        {/* Nav */}
        <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <Dumbbell className="text-primary" size={26} />
            <span className="font-display font-extrabold text-xl tracking-tight text-foreground">
              GymVoice
            </span>
          </div>
          <SubmitReviewDialog />
        </header>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-start justify-center px-6 pb-24 pt-12 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="text-primary font-display font-bold text-sm tracking-widest uppercase mb-3 flex items-center gap-2">
              <Flame size={14} /> Member Reviews
            </p>
            <h1 className="font-display font-extrabold text-5xl sm:text-7xl leading-none tracking-tight text-foreground mb-4">
              REAL TALK
              <br />
              <span className="text-primary">FROM THE</span>
              <br />
              FLOOR.
            </h1>
            <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
              Unfiltered opinions from the members who train here every day. No
              sales pitch — just the truth.
            </p>
          </motion.div>
          <motion.div
            className="mt-4 text-muted-foreground/40"
            animate={{ y: [0, 8, 0] }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 2.2,
              ease: "easeInOut",
            }}
          >
            <ChevronDown size={28} />
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* STATS BAR */}
      {/* ------------------------------------------------------------------ */}
      <section
        data-ocid="stats.section"
        className="bg-secondary border-y border-border py-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16"
        >
          <div className="flex items-center gap-4">
            <span className="font-display font-extrabold text-4xl text-primary">
              {avgRating.toFixed(1)}
            </span>
            <div>
              <StarDisplay rating={Math.round(avgRating)} size={20} />
              <p className="text-xs text-muted-foreground mt-1">
                Average Rating
              </p>
            </div>
          </div>
          <div className="w-px h-12 bg-border hidden sm:block" />
          <div className="flex items-center gap-4">
            <span className="font-display font-extrabold text-4xl text-foreground">
              {allReviews.length}
            </span>
            <div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users size={18} />
                <span className="font-display font-semibold text-sm">
                  Member Reviews
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From verified gym members
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* REVIEWS SECTION */}
      {/* ------------------------------------------------------------------ */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
        <section data-ocid="reviews.section">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <h2 className="font-display font-extrabold text-2xl text-foreground">
              Member Opinions
            </h2>
            <Tabs value={activeFilter} onValueChange={setActiveFilter}>
              <TabsList className="bg-secondary border border-border flex-wrap h-auto gap-1 p-1">
                {CATEGORIES.map((cat) => (
                  <TabsTrigger
                    key={cat.value}
                    value={cat.value}
                    data-ocid="filter.tab"
                    className="text-xs font-display font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Loading */}
          {isLoading && (
            <div
              data-ocid="reviews.loading_state"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {["s1", "s2", "s3", "s4", "s5", "s6"].map((sk) => (
                <div
                  key={sk}
                  className="rounded-lg border border-border bg-card p-5 flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-9 h-9 rounded-full bg-secondary" />
                    <div className="flex flex-col gap-1.5">
                      <Skeleton className="h-3 w-24 bg-secondary" />
                      <Skeleton className="h-3 w-16 bg-secondary" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-20 bg-secondary" />
                  <Skeleton className="h-16 w-full bg-secondary" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {isError && !isLoading && (
            <div
              data-ocid="reviews.error_state"
              className="text-center py-20 text-destructive"
            >
              <p className="font-display font-bold text-lg">
                Failed to load reviews.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Please refresh and try again.
              </p>
            </div>
          )}

          {/* Reviews Grid */}
          {!isLoading && !isError && (
            <AnimatePresence mode="wait">
              {filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  data-ocid="reviews.empty_state"
                  className="flex flex-col items-center justify-center py-24 text-center gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                    <MessageSquarePlus
                      size={28}
                      className="text-muted-foreground"
                    />
                  </div>
                  <div>
                    <p className="font-display font-bold text-lg text-foreground">
                      No opinions yet in this category
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Be the first to share your experience!
                    </p>
                  </div>
                  <SubmitReviewDialog />
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {filtered.map((review, i) => (
                    <ReviewCard
                      key={`${review.author}-${i}`}
                      review={review}
                      index={i}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </section>
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* FOOTER */}
      {/* ------------------------------------------------------------------ */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Dumbbell size={16} className="text-primary" />
            <span className="font-display font-bold text-foreground">
              GymVoice
            </span>
            <span className="text-muted-foreground/50">—</span>
            <span>Real members. Real opinions.</span>
          </div>
          <p>
            © {year}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
