"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTypewriter } from "./hooks/useTypewriter";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import lightLogo from "./light-theme.png";
import darkLogo from "./dark-theme.png";

//? SHADCN COMPONENTS
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Menu, AlertCircle, CheckCircle2, Filter, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const WORDS_LIST = [
  "Apa rencana hari ini?",
  "Pergi ke pasar...",
  "Mabar Delta Force 3 jam...",
  "Push rank sampai immortal...",
  "Olahraga pagi 30 menit...",
  "Baca buku 15 menit...",
  "Meeting dengan klien...",
  "Summit gunung di Roblox...",
  "Beli kopi susu gula aren...",
  "Jadi...",
];

function TodoContent() {
  const { data: session, status } = useSession();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [formError, setFormError] = useState("");
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  //? -- sapaan
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat pagi";
    if (hour < 15) return "Selamat siang";
    if (hour < 18) return "Selamat sore";
    return "Selamat malam";
  };

  //? -- buat typing
  const placeholderText = useTypewriter(WORDS_LIST);

  //? -- cek url saat halaman loading
  useEffect(() => {
    if (searchParams.get("loggedin")) {
      setShowLoginSuccess(true);
      setIsExiting(false);

      const timerExit = setTimeout(() => {
        setIsExiting(true);
      }, 3500);

      const timerRemove = setTimeout(() => {
        setShowLoginSuccess(false);
        window.history.replaceState(null, "", "/");
      }, 4000);

      return () => {
        clearTimeout(timerExit);
        clearTimeout(timerRemove);
      };
    }
  }, [searchParams]);

  useEffect(() => {
    setMounted(true);
  }, []);

  //? -- effect (untuk memuat data)
  useEffect(() => {
    if (status === "authenticated") {
      fetchCategories();
      fetchTasks();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status]);

  //! --- LOGIC EXPANDED TASK ---
  const toggleExpand = (id) => {
    const newSet = new Set(expandedTasks);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedTasks(newSet);
  };

  //! --- LOGIC FUNCTION ---
  //? -- ambil data kategori
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
      if (data && data.length > 0) setSelectedCategory(data[0].id.toString());
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  //? -- ambil data task
  const fetchTasks = async (query = "") => {
    try {
      const res = await fetch(`api/todos?q=${query}`);
      const data = await res.json();
      setTasks(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  //? -- tambah data task
  const handleAddTask = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!newTask) {
      setFormError("Judul tidak boleh kosong!");
      return;
    }

    if (!selectedCategory) {
      setFormError("Kategori tidak boleh kosong!");
      return;
    }

    const res = await fetch("/api/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: newTask,
        categoryId: selectedCategory,
      }),
    });

    if (res.ok) {
      setNewTask(""); // -> reset input
      fetchTasks(); // -> refresh data
    }
  };

  //? -- 4. delete task
  const handleDelete = async (id) => {
    await fetch(`/api/todos/${id}`, {
      method: "DELETE",
    });
    fetchTasks(); // -> refresh data
  };

  const executeClearAll = async () => {
    if (tasks.length === 0) return;

    setIsLoading(true);
    try {
      await Promise.all(
        tasks.map((task) =>
          fetch(`/api/todos/${task.id}`, {
            method: "DELETE",
          })
        )
      );
      fetchTasks();
    } catch (error) {
      setFormError("Gagal menghapus data. Silahkan coba lagi.");
      setIsLoading(false);
    }
  };

  //? -- 5. update toggle status
  const handleToggle = async (id, isChecked) => {
    const updatedTasks = tasks.map((t) =>
      t.id === id ? { ...t, isCompleted: isChecked } : t
    );
    setTasks(updatedTasks);
    await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCompleted: isChecked }),
    });
  };

  //? -- LOGIC SERACH REAL-TIME
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchTasks(query);
  };

  //? -- LOGIC FILTER CLIENT-SIDE
  const filteredTasks = tasks.filter((task) => {
    //! Cek Status
    const matchStatus =
      (filterStatus === "completed" && task.isCompleted) ||
      (filterStatus === "active" && !task.isCompleted) ||
      filterStatus === "all";

    //! Cek Kategori
    const matchCategory =
      filterCategory === "all" || task.categoryId.toString() === filterCategory;

    return matchStatus && matchCategory;
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-slate-950 dark:text-white">
        Loading...
      </div>
    );
  }

  //? -- Loading cek session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Memuat User...
      </div>
    );
  }

  //* --- UI RENDER ---
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-10 dark:bg-slate-900 dark:border-b dark:border-slate-800 transition-colors">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          {/* KIRI */}
          <div className="flex flex-col justify-center">
            <div className="logo">
              <Link href="/" className="flex items-center gap-3">
                {/* --- LOGO IMAGE --- */}
                {mounted ? (
                  <Image
                    src={resolvedTheme === "dark" ? darkLogo : lightLogo}
                    alt="Logo Brand"
                    width={50}
                    height={50}
                    className="object-contain"
                    priority
                  />
                ) : (
                  <div className="w-[50px] h-[50px]" />
                )}

                <span className="font-bold text-xl md:text-2xl tracking-tight text-gray-900 dark:text-white">
                  RAMPUNG!
                  <p className="text-sm text-black font-medium dark:text-white">
                    to-do app
                  </p>
                </span>
              </Link>
            </div>
          </div>

          {/* KANAN (DESKTOP) */}
          <div className="hidden md:flex items-center gap-4">
            <ModeToggle />
            <img
              src={`https://ui-avatars.com/api/?name=${session?.user?.name}&background=random&color=fff&rounded=true`}
              alt="Profile"
              className="w-10 h-10 rounded-full border border-gray-200 dark:border-slate-700"
            />
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium border border-red-200 dark:border-red-900 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              Logout
            </button>
          </div>

          {/* KANAN (MOBILE) */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Info Profil di Dropdown */}
                <DropdownMenuItem className="flex items-center gap-2 cursor-default focus:bg-transparent">
                  <img
                    src={`https://ui-avatars.com/api/?name=${session?.user?.name}&background=random&color=fff&rounded=true`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-sm truncate w-32">
                      {session?.user?.name}
                    </span>
                    <span className="text-xs text-gray-500 truncate w-32">
                      {session?.user?.email}
                    </span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Dark Mode Toggle */}
                <div className="p-2 flex justify-between items-center">
                  <span className="text-sm px-2">Tema</span>
                  <ModeToggle />
                </div>

                <DropdownMenuSeparator />

                {/* Tombol Logout */}
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer"
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* ALERT JIKA ADA ERROR */}
        {formError && (
          <Alert
            variant="destructive"
            className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        {/* ALERT LOGIN SUKSES */}
        {showLoginSuccess && (
          <Alert
            className={`
              mb-4 bg-green-50 border-green-200 text-green-800 
              dark:bg-green-900/20 dark:border-green-900 dark:text-green-300
              transition-all duration-500 ease-in-out transform 
              ${
                isExiting
                  ? "opacity-0 -translate-y-5"
                  : "opacity-100 translate-y-0"
              }
            `}
          >
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Berhasil Masuk!</AlertTitle>
            <AlertDescription>
              Selamat datang, {session?.user?.name}.
            </AlertDescription>
          </Alert>
        )}

        {/* Form Input */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-slate-800 transition-colors">
          {/* Sapaan & Nama */}
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              {getGreeting()}
            </p>
            <h1 className="text-xl font-bold text-foreground">
              {session?.user?.name || "User"} 👋
            </h1>
          </div>

          <form
            onSubmit={handleAddTask}
            className="flex flex-col md:flex-row gap-3 pt-3"
          >
            <input
              type="text"
              placeholder={placeholderText}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-200 outline-none bg-white border-gray-300 text-gray-900 dark:bg-slate-950 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
              value={newTask}
              onChange={(e) => {
                setNewTask(e.target.value);
                if (formError) setFormError("");
              }}
            />
            <div className="w-full md:w-[200px]">
              <Select
                value={selectedCategory}
                onValueChange={(val) => {
                  setSelectedCategory(val);
                  if (formError) setFormError("");
                }}
              >
                <SelectTrigger className="w-full h-11 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-200 outline-none bg-white border-gray-300 text-gray-900 dark:bg-slate-950 dark:border-slate-700 dark:text-white dark:placeholder-slate-500">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 && (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  )}

                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg cursor-pointer hover:bg-primary/90 transition font-medium dark:bg-white dark:text-black"
            >
              Tambah
            </button>
          </form>
        </section>

        {/* Tools (Search & Filter) */}
        <section className="flex flex-col md:flex-row justify-between gap-4">
          <input
            type="text"
            placeholder="Cari tugas..."
            className="px-4 py-2 border border-input bg-background rounded-lg w-full md:w-64"
            value={searchQuery}
            onChange={handleSearch}
          />

          <div className="flex flex-1 gap-2 flex-col md:flex-row">
            {/* Filter Kategori Dropdown */}
            <div className="w-full md:w-[180px]">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full h-10 bg-white border-gray-300 text-gray-900 dark:bg-slate-900 dark:border-slate-800 dark:text-white">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <SelectValue placeholder="Semua Kategori" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter Status (All/Active/Completed) */}
          <div className="flex bg-gray-200 p-1 rounded-lg self-start dark:bg-slate-800 h-10 items-center relative">
            {["all", "active", "completed"].map((status) => {
              const isActive = filterStatus === status;

              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`relative px-4 py-1 rounded-md text-sm capitalize transition-colors duration-200 h-8 flex items-center justify-center outline-none focus-visible:ring-2
          ${
            isActive
              ? "text-black font-medium dark:text-black"
              : "text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  {/* BACKGROUND ANIMASI */}
                  {isActive && (
                    <motion.div
                      layoutId="activeFilter"
                      className="absolute inset-0 bg-white shadow rounded-md dark:bg-white"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}

                  <span className="relative z-10">{status}</span>
                </button>
              );
            })}
            {/* --- TOMBOL CLEAR ALL --- */}
            {tasks.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="h-10 w-10 flex items-center justify-center rounded-lg border text-red-500  hover:bg-red-50 hover:text-red-700 dark:border-black dark:text-black dark:bg-white "
                    title="Hapus Semua Tugas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white dark:bg-slate-900">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="dark:text-white">
                      Hapus Semua Tugas?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="dark:text-slate-400">
                      Tindakan ini akan menghapus{" "}
                      <strong>{tasks.length} tugas</strong> secara permanen.
                      Data yang dihapus tidak dapat dikembalikan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="dark:bg-slate-800 dark:text-white">
                      Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={executeClearAll}
                      className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-600"
                    >
                      Ya, Hapus Semua
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </section>

        {/* Task List */}
        <section>
          {isLoading ? (
            <div className="text-center py-10 text-gray-400 dark:text-slate-500">
              Memuat data...
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.length === 0 && (
                <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300 dark:bg-slate-900 dark:border-slate-800">
                  <p className="text-gray-500 dark:text-slate-400">
                    {searchQuery
                      ? `Tidak ditemukan tugas dengan kata kunci "${searchQuery}"`
                      : filterCategory !== "all"
                      ? `Tidak ada tugas pada kategori ${
                          categories.find(
                            (c) => c.id.toString() === filterCategory
                          )?.name || "Terpilih"
                        }.`
                      : "Tidak ada tugas."}
                  </p>
                </div>
              )}
              {filteredTasks.map((task) => {
                const isExpanded = expandedTasks.has(task.id);
                return (
                  <div
                    key={task.id}
                    className={`group flex items-start justify-between p-4 rounded-xl shadow-sm border transition hover:shadow-md ${
                      task.isCompleted
                        ? "opacity-60 bg-gray-50 border-gray-100 dark:bg-slate-900/50 dark:border-slate-800"
                        : "bg-white border-gray-100 dark:bg-slate-900 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex gap-4 flex-1 min-w-0">
                      {/* --- CHECKBOX --- */}
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={task.isCompleted}
                        onCheckedChange={(checked) => {
                          handleToggle(task.id, checked);
                        }}
                        className="mt-1 w-5 h-5 border-2 border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black data-[state=checked]:text-white dark:border-slate-500 dark:data-[state=checked]:bg-white dark:data-[state=checked]:border-white dark:data-[state=checked]:text-black"
                      />

                      <div
                        className="flex flex-col flex-1 min-w-0 select-none"
                        onClick={() => toggleExpand(task.id)}
                        title="Klik untuk melihat selengkapnya"
                      >
                        <span
                          className={`font-medium text-base transition-all ${
                            task.isCompleted
                              ? "line-through text-gray-400 dark:text-slate-500"
                              : "text-gray-800 dark:text-slate-100"
                          } ${
                            isExpanded
                              ? "break-words whitespace-normal"
                              : "truncate"
                          }`}
                        >
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded w-fit ${task.category.color} opacity-90 truncate`}
                          >
                            {task.category.name}
                          </span>
                          {!isExpanded && task.title.length > 40 && (
                            <span className="text-[10px] text-blue-500 dark:text-blue-400 cursor-pointer">
                              Selengkapnya...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* --- Clear per Item --- */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:text-white dark:hover:text-red-400 dark:hover:bg-red-900/20 opacity-100 md:opacity-0 group-hover:opacity-100 transition p-2 rounded-lg ml-2 self-start"
                          title="Hapus Tugas Ini"
                        >
                          <Trash2 className="w-4 h-4 cursor-pointer" />
                        </button>
                      </AlertDialogTrigger>

                      {/* ISI POPUP KONFIRMASI */}
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="dark:text-white">
                            Hapus Tugas?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="dark:text-slate-400">
                            Apakah Anda yakin ingin menghapus tugas{" "}
                            <strong>"{task.title}"</strong>?
                            <br />
                            Tindakan ini tidak bisa dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            onClick={(e) => e.stopPropagation()}
                            className="dark:bg-slate-800 dark:text-white"
                          >
                            Batal
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(e) => {
                              e.stopPropagation();
                              // Panggil fungsi delete kamu
                              handleDelete(task.id);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-600"
                          >
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="text-center py-8 text-muted-foreground text-sm">
        <p>
          &copy; {new Date().getFullYear()} Dibuat oleh{" "}
          <a
            className="cursor-pointer hover:underline dark:text-white"
            href="https://www.linkedin.com/in/sultvnnnn"
            target="_blank"
            rel="noopener noreferrer"
          >
            @Sultvnnnn
          </a>
        </p>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          Loading aplikasi...
        </div>
      }
    >
      <TodoContent />
    </Suspense>
  );
}
