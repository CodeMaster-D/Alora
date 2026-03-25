"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Lock, 
  Unlock,
  Eye,
  Edit,
  Trash2,
  BookOpen,
  Smile,
  Frown,
  Meh
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { JournalEntry } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { useJournalStore } from "@/store/journalStore";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function JournalPage() {
  const { user } = useAuthStore();
  const { journalEntries, fetchJournalEntries, deleteJournalEntry } = useJournalStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        await fetchJournalEntries(user.id);
      } catch (error) {
        console.error("Error fetching journal entries:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, fetchJournalEntries]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEntries(journalEntries);
    } else {
      const filtered = journalEntries.filter(
        (entry) =>
          entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredEntries(filtered);
    }
  }, [searchQuery, journalEntries]);

  const getMoodIcon = (mood?: number) => {
    if (!mood) return null;
    switch (mood) {
      case 1:
      case 2: return <Frown className="h-4 w-4" />;
      case 3: return <Meh className="h-4 w-4" />;
      case 4:
      case 5: return <Smile className="h-4 w-4" />;
      default: return <Meh className="h-4 w-4" />;
    }
  };

  const getMoodColor = (mood?: number) => {
    if (!mood) return "text-muted-foreground border-border bg-muted/5";
    switch (mood) {
      case 1: return "text-blue-500 border-blue-500/20 bg-blue-500/5 shadow-blue-500/10";
      case 2: return "text-indigo-500 border-indigo-500/20 bg-indigo-500/5 shadow-indigo-500/10";
      case 3: return "text-amber-500 border-amber-500/20 bg-amber-500/5 shadow-amber-500/10";
      case 4: return "text-green-500 border-green-500/20 bg-green-500/5 shadow-green-500/10";
      case 5: return "text-emerald-500 border-emerald-500/20 bg-emerald-500/5 shadow-emerald-500/10";
      default: return "text-muted-foreground border-border bg-muted/5";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  const handleViewEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsViewDialogOpen(true);
  };

  const handleDeleteEntry = async () => {
    if (!selectedEntry) return;
    const success = await deleteJournalEntry(selectedEntry.id);
    if (success) {
      setIsDeleteDialogOpen(false);
      setIsViewDialogOpen(false);
      setSelectedEntry(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-medium tracking-tight bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
            Journal
          </h1>
          <p className="text-foreground/60 font-medium italic">Record your thoughts and feelings to track your mental health journey.</p>
        </div>
      <Button className="rounded-2xl h-12 px-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all font-medium" asChild>
          <a href="/journal/new">
            <Plus className="mr-2 h-5 w-5" />
            New Entry
          </a>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            placeholder="Search entries..."
            className="pl-9 rounded-xl bg-white/40 border-white/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="rounded-xl border-white/20 bg-white/40">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        /* SKELETON LOADING STATE */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="h-[220px] flex flex-col border-white/20 bg-white/20 overflow-hidden">
              <CardHeader className="space-y-2">
                <Skeleton className="h-5 w-3/4 bg-white/40" />
                <Skeleton className="h-4 w-1/4 bg-white/40" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full bg-white/40" />
                <Skeleton className="h-4 w-full bg-white/40" />
                <Skeleton className="h-4 w-2/3 bg-white/40" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredEntries.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredEntries.map((entry) => (
            <motion.div key={entry.id} variants={itemVariants}>
              <Card className={cn(
                "h-full flex flex-col border-white/20 dark:border-white/5 bg-white/40 dark:bg-black/20 backdrop-blur-sm group hover:shadow-xl transition-all duration-500 rounded-[32px] relative overflow-hidden",
                entry.mood && getMoodColor(entry.mood).split(' ').find(c => c.startsWith('shadow-'))
              )}>
                {entry.mood && (
                   <div className={cn("absolute -top-10 -right-10 w-24 h-24 blur-[40px] opacity-10 rounded-full", getMoodColor(entry.mood).split(' ').find(c => c.startsWith('bg-')))} />
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-1 group-hover:text-[#D48C70] transition-colors">{entry.title}</CardTitle>
                    <div className="flex items-center space-x-1">
                      {entry.isPrivate ? (
                        <Lock className="h-4 w-4 text-muted-foreground/40" />
                      ) : (
                        <Unlock className="h-4 w-4 text-muted-foreground/40" />
                      )}
                      {entry.mood && (
                        <div className={cn("flex items-center justify-center w-8 h-8 rounded-xl border transition-all", getMoodColor(entry.mood))}>
                          {getMoodIcon(entry.mood)}
                        </div>
                      )}
                    </div>
                  </div>
                  <CardDescription className="flex items-center text-xs font-semibold uppercase tracking-wider opacity-60">
                    <Calendar className="mr-1.5 h-3 w-3" />
                    {formatDate(entry.timestamp)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground/80 line-clamp-3 mb-4 italic">
                    &quot;{entry.content}&quot;
                  </p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {entry.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] bg-[#D48C70]/10 text-[#D48C70] border-none font-bold uppercase">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-auto flex justify-between items-center border-t border-white/10 pt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-[#D48C70]/10 hover:text-[#D48C70] rounded-full px-4"
                      onClick={() => handleViewEntry(entry)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0 opacity-40 hover:opacity-100 transition-opacity">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border-white/20 backdrop-blur-xl">
                        <DropdownMenuItem asChild className="focus:bg-[#D48C70] focus:text-white">
                          <Link href={`/journal/edit/${entry.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedEntry(entry);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40 italic">
          <BookOpen className="h-16 w-16 mb-4 stroke-1" />
          <h3 className="text-xl font-medium mb-1">No journal entries found</h3>
          <p className="text-sm max-w-[250px]">
            {searchQuery
              ? "Try adjusting your search query."
              : "Start documenting your journey today."}
          </p>
          {!searchQuery && (
            <Button asChild className="mt-6 rounded-full bg-[#D48C70]">
              <Link href="/journal/new">
                <Plus className="mr-2 h-4 w-4" />
                Create First Entry
              </Link>
            </Button>
          )}
        </div>
      )}

      {/* View Entry Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-[32px] border-white/20 bg-white/80 backdrop-blur-2xl">
          {selectedEntry && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl font-bold">{selectedEntry.title}</DialogTitle>
                  <div className="flex items-center space-x-2">
                    {selectedEntry.isPrivate ? <Lock className="h-4 w-4 opacity-30" /> : <Unlock className="h-4 w-4 opacity-30" />}
                    {selectedEntry.mood && (
                      <div className={getMoodColor(selectedEntry.mood)}>
                        {getMoodIcon(selectedEntry.mood)}
                      </div>
                    )}
                  </div>
                </div>
                <DialogDescription className="font-bold text-[#D48C70] uppercase text-[10px] tracking-widest pt-1">
                  {formatDate(selectedEntry.timestamp)}
                </DialogDescription>
              </DialogHeader>
              <div className="py-6">
                <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/80 italic font-medium">
                  &quot;{selectedEntry.content}&quot;
                </p>
                <div className="flex flex-wrap gap-2 mt-8">
                  {selectedEntry.tags.map((tag) => (
                    <Badge key={tag} className="bg-[#D48C70]/10 text-[#D48C70] border-none text-[10px] font-black uppercase">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="ghost" className="rounded-full" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button asChild className="rounded-full bg-[#D48C70] px-6">
                  <Link href={`/journal/edit/${selectedEntry.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Entry
                  </Link>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this journal entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" className="rounded-full" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" className="rounded-full" onClick={handleDeleteEntry}>
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}