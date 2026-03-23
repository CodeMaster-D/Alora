"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Save, 
  X, 
  Tag, 
  Lock, 
  Unlock,
  Smile,
  Frown,
  Meh,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { JournalEntry } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { useJournalStore } from "@/store/journalStore";
import { cn } from "@/lib/utils";

export default function EditJournalPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const { updateJournalEntry, fetchJournalEntry } = useJournalStore();
  
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [mood, setMood] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Fetch journal entry on mount
  useEffect(() => {
    const fetchEntry = async () => {
      if (!user || !params.id) return;
      
      setIsLoading(true);
      
      try {
        const journalEntry = await fetchJournalEntry(params.id as string);
        
        if (!journalEntry) {
          toast.error("Journal entry not found");
          router.push("/journal");
          return;
        }
        
        if (journalEntry.userId !== user.id) {
          toast.error("You don't have permission to edit this entry");
          router.push("/journal");
          return;
        }
        
        setEntry(journalEntry);
        setTitle(journalEntry.title);
        setContent(journalEntry.content);
        setTags(journalEntry.tags || []);
        setIsPrivate(journalEntry.isPrivate);
        setMood(journalEntry.mood);
      } catch (error) {
        console.error("Error fetching journal entry:", error);
        toast.error("Failed to load journal entry");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEntry();
  }, [user, params.id, fetchJournalEntry, router]);

  // Track unsaved changes
  useEffect(() => {
    if (entry) {
      const changed = 
        title !== entry.title ||
        content !== entry.content ||
        JSON.stringify([...tags].sort()) !== JSON.stringify([...(entry.tags || [])].sort()) ||
        isPrivate !== entry.isPrivate ||
        mood !== entry.mood;
      
      setHasUnsavedChanges(changed);
    }
  }, [title, content, tags, isPrivate, mood, entry]);

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const getMoodIcon = (moodValue: number) => {
    switch (moodValue) {
      case 1:
      case 2:
        return <Frown className="h-5 w-5" />;
      case 3:
        return <Meh className="h-5 w-5" />;
      case 4:
      case 5:
        return <Smile className="h-5 w-5" />;
      default:
        return <Meh className="h-5 w-5" />;
    }
  };

  const getMoodColor = (moodValue: number) => {
    switch (moodValue) {
      case 1:
        return "text-red-500 border-red-500";
      case 2:
        return "text-orange-500 border-orange-500";
      case 3:
        return "text-yellow-500 border-yellow-500";
      case 4:
        return "text-green-500 border-green-500";
      case 5:
        return "text-emerald-500 border-emerald-500";
      default:
        return "text-gray-500 border-gray-500";
    }
  };

  const getMoodLabel = (moodValue: number) => {
    switch (moodValue) {
      case 1:
        return "Very Sad";
      case 2:
        return "Sad";
      case 3:
        return "Neutral";
      case 4:
        return "Happy";
      case 5:
        return "Very Happy";
      default:
        return "No Mood";
    }
  };

  const handleSave = async () => {
    if (!entry || !user) return;
    
    // Validation with Toasts
    if (!title.trim()) {
      toast.warning("Please enter a title");
      return;
    }
    
    if (!content.trim()) {
      toast.warning("Please enter some content");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const updatedEntry: Partial<JournalEntry> = {
        title: title.trim(),
        content: content.trim(),
        tags,
        isPrivate,
        mood,
        updatedAt: new Date(),
      };
      
      const success = await updateJournalEntry(entry.id, updatedEntry);
      
      if (success) {
        toast.success("Changes saved successfully!");
        setHasUnsavedChanges(false);
        router.push("/journal");
      } else {
        toast.error("Failed to save changes");
      }
    } catch (error) {
      console.error("Error saving journal entry:", error);
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNavigation = (url: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(url);
      setIsLeaveDialogOpen(true);
    } else {
      router.push(url);
    }
  };

  const confirmLeave = () => {
    setIsLeaveDialogOpen(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading journal entry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleNavigation("/journal")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Journal Entry</h1>
            <p className="text-muted-foreground">
              Update your thoughts and feelings
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => handleNavigation("/journal")}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Form Content */}
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Title Input */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Title</CardTitle>
              <CardDescription>
                Give your entry a meaningful title
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Enter title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Textarea */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Content</CardTitle>
              <CardDescription>
                Write your thoughts and feelings in detail
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px] resize-none"
              />
              <div className="flex justify-between mt-2">
                <span className="text-sm text-muted-foreground">
                  {content.length} characters
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mood Selection */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How are you feeling?</CardTitle>
              <CardDescription>
                Select your current mood (optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={mood?.toString() || ""}
                onValueChange={(value) => setMood(value ? parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">
                    <div className="flex items-center space-x-2">
                      <div className="text-red-500">{getMoodIcon(1)}</div>
                      <span>Very Sad</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="2">
                    <div className="flex items-center space-x-2">
                      <div className="text-orange-500">{getMoodIcon(2)}</div>
                      <span>Sad</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="3">
                    <div className="flex items-center space-x-2">
                      <div className="text-yellow-500">{getMoodIcon(3)}</div>
                      <span>Neutral</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="4">
                    <div className="flex items-center space-x-2">
                      <div className="text-green-500">{getMoodIcon(4)}</div>
                      <span>Happy</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="5">
                    <div className="flex items-center space-x-2">
                      <div className="text-emerald-500">{getMoodIcon(5)}</div>
                      <span>Very Happy</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {mood && (
                <div className="mt-3 flex items-center space-x-2">
                  <div className={cn("p-2 rounded-full border", getMoodColor(mood))}>
                    {getMoodIcon(mood)}
                  </div>
                  <span className="text-sm font-medium">{getMoodLabel(mood)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Tags */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tags</CardTitle>
              <CardDescription>
                Add tags to categorize your entry
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Add a tag..."
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-9"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                  disabled={!currentTag.trim()}
                >
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy Settings */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Privacy</CardTitle>
              <CardDescription>
                Control who can see this entry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isPrivate ? (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Unlock className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">Private Entry</p>
                    <p className="text-sm text-muted-foreground">
                      {isPrivate
                        ? "Only you can see this entry"
                        : "This entry can be shared with your therapist"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Unsaved Changes Dialog */}
      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to leave?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLeaveDialogOpen(false)}
            >
              Stay
            </Button>
            <Button variant="destructive" onClick={confirmLeave}>
              Leave Without Saving
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}