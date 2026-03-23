"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Save, 
  Eye, 
  EyeOff, 
  Mic, 
  MicOff,
  X,
  Smile,
  Frown,
  Meh,
  Edit 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { JournalForm } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { useJournalStore } from "@/store/journalStore";
import { useAccessibilityStore } from "@/store/useAccessbilityStore"; // Pastikan path ini benar (typo dari file lu sebelumnya)
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// --- TYPE DEFINITIONS UNTUK MEMBERSIHKAN 'ANY' ---
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

// Interface untuk casting window tanpa 'any'
interface CustomWindow extends Window {
  webkitSpeechRecognition?: new () => SpeechRecognition;
  SpeechRecognition?: new () => SpeechRecognition;
}
// ------------------------------------------------

export default function NewJournalPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addJournalEntry } = useJournalStore();
  const { fontSize, fontFamily } = useAccessibilityStore();
  
  const [formData, setFormData] = useState<JournalForm>({
    title: "",
    content: "",
    isPrivate: false,
    tags: [],
    mood: undefined,
  });
  
  const [tagInput, setTagInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null); 

  useEffect(() => {
    const win = window as unknown as CustomWindow;
    const SpeechRecognitionConstructor = win.webkitSpeechRecognition || win.SpeechRecognition;

    if (typeof window !== "undefined" && SpeechRecognitionConstructor) {
      setIsSpeechRecognitionSupported(true);
      const newRecognition = new SpeechRecognitionConstructor();
      newRecognition.continuous = true;
      // FIX: Set ke false biar teks nggak double pas lagi ngomong
      newRecognition.interimResults = false;
      newRecognition.lang = "id-ID"; // Set ke bahasa Indonesia biar akurat
      
      newRecognition.onresult = (event: SpeechRecognitionEvent) => {
        // FIX: Ambil hasil yang paling terakhir (final) aja
        const currentTranscript = event.results[event.resultIndex][0].transcript;
        
        setFormData(prev => ({
          ...prev,
          // Tambahin spasi kalau sebelumnya udah ada teks, biar nggak nempel
          content: prev.content ? prev.content + " " + currentTranscript : currentTranscript
        }));
      };
      
      newRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);

        // Mapping error yang rapi
        const errorMessages: Record<string, string> = {
          "audio-capture": "Mikrofon tidak terdeteksi atau sedang digunakan aplikasi lain.",
          "not-allowed": "Izin mikrofon ditolak oleh browser.",
          "no-speech": "Tidak ada suara yang terdengar.",
          "network": "Masalah koneksi internet pada server pengenalan suara.",
          "aborted": "Proses perekaman dihentikan.",
        };

        const friendlyMessage = errorMessages[event.error] || "Terjadi kesalahan pada mikrofon.";
        
        toast.error(friendlyMessage, {
          description: `Technical error: ${event.error}`
        });
      };

      // FIX: Otomatis matiin state isListening kalau mikrofon mati/timeout
      newRecognition.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(newRecognition);
    }

    // Cleanup pas pindah halaman
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "small": return "text-sm";
      case "large": return "text-lg";
      default: return "text-base";
    }
  };

  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case "dyslexic": return "font-dyslexic";
      case "hyperlegible": return "font-hyperlegible";
      default: return "";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTogglePrivate = () => {
    setFormData(prev => ({ ...prev, isPrivate: !prev.isPrivate }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleMoodSelect = (mood: number) => {
    setFormData(prev => ({
      ...prev,
      mood: prev.mood === mood ? undefined : mood
    }));
  };

  const handleToggleListening = () => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
      toast.success("Mendengarkan... Silakan mulai berbicara.");
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.warning("Judul dan konten tidak boleh kosong.");
      return;
    }
    
    setIsSaving(true);
    try {
      const success = await addJournalEntry(user.id, formData);
      if (success) {
        toast.success("Jurnal berhasil disimpan!");
        router.push("/journal");
      }
    } catch (error) {
      toast.error("Gagal menyimpan jurnal.");
    } finally {
      setIsSaving(false);
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
    <motion.div className="p-6 max-w-4xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Journal Entry</h1>
          <p className="text-muted-foreground">Record your thoughts and feelings.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setIsPreview(!isPreview)}>
            {isPreview ? <Edit className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {isPreview ? "Edit" : "Preview"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsBlurred(!isBlurred)}>
            {isBlurred ? <Eye className="mr-2 h-4 w-4" /> : <EyeOff className="mr-2 h-4 w-4" />}
            {isBlurred ? "Show" : "Blur"}
          </Button>
        </div>
      </div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Entry Details</CardTitle>
            <CardDescription>Add the details of your journal entry.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Give your entry a title..."
                value={formData.title}
                onChange={handleInputChange}
                className={cn(getFontSizeClass(), getFontFamilyClass())}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Content</Label>
                {isSpeechRecognitionSupported && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleToggleListening}
                    className={cn(isListening && "bg-red-50 text-red-600 border-red-200")}
                  >
                    {isListening ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                    {isListening ? "Stop Voice" : "Use Voice"}
                  </Button>
                )}
              </div>
              <Textarea
                id="content"
                name="content"
                placeholder="Write about your thoughts..."
                value={formData.content}
                onChange={handleInputChange}
                ref={textareaRef}
                rows={10}
                className={cn(getFontSizeClass(), getFontFamilyClass(), isBlurred && "blur-sm")}
              />
            </div>

            <div className="space-y-2">
              <Label>Mood</Label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((m) => {
                  const isSelected = formData.mood === m;
                  const Icon = m <= 2 ? Frown : m === 3 ? Meh : Smile;
                  const color = m <= 2 ? "text-red-500" : m === 3 ? "text-yellow-500" : "text-green-500";
                  return (
                    <Button
                      key={m}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="icon"
                      onClick={() => handleMoodSelect(m)}
                      className={cn(isSelected && color, "h-10 w-10")}
                    >
                      <Icon className="h-5 w-5" />
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="tags"
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag} <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="isPrivate" checked={formData.isPrivate} onCheckedChange={handleTogglePrivate} />
              <Label htmlFor="isPrivate">Make this entry private</Label>
            </div>

            <Separator />

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => router.push("/journal")}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Entry</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {isPreview && (
        <motion.div variants={itemVariants} className="mt-6">
          <Card>
            <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
            <CardContent className={cn(getFontSizeClass(), getFontFamilyClass())}>
              <h2 className="text-2xl font-bold mb-2">{formData.title || "Untitled"}</h2>
              <div className="whitespace-pre-wrap mb-4">{formData.content || "No content..."}</div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}