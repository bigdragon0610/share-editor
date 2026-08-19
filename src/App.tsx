import Editor from "@monaco-editor/react";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { db } from "./firebase/firebase";
import { useTheme } from "./hooks/useTheme";

function App() {
  const [language, setLanguage] = useState("");
  const [code, setCode] = useState("");
  const docId = useRef<string | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";

  const addCode = async () => {
    try {
      if (docId.current) {
        await updateDoc(doc(db, "documents", docId.current), {
          language,
          code,
        });
      } else {
        const docRef = await addDoc(collection(db, "documents"), {
          language,
          code,
        });
        docId.current = docRef.id;
      }
      const url = window.location.origin + "?id=" + docId.current;
      setShareUrl(url);
      navigator.clipboard.writeText(url);
      setIsModalOpen(true);
      setTimeout(() => {
        setIsModalOpen(false);
      }, 5000);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const getCode = async (id: string | null) => {
      if (!id) return;
      const docSnap = await getDoc(doc(db, "documents", id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data) {
          setLanguage(data.language);
          setCode(data.code);
        }
      }
    };
    getCode(id);
  }, []);

  return (
    <>
      {/* 改善されたモーダル */}
      <div
        className={
          (isModalOpen ? "opacity-100 top-4" : "opacity-0 -top-4 invisible") +
          " transition-all duration-500 ease-out absolute z-50 w-[calc(100%-2rem)] max-w-md left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 px-6 py-4 shadow-lg dark:shadow-black/40 backdrop-blur-sm"
        }
        role="alert"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
            <span className="i-mdi-check text-emerald-600 dark:text-emerald-400 w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
              URLがコピーされました！
            </p>
            <a
              className="text-sm text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 underline underline-offset-2 break-all transition-colors"
              href={shareUrl}
              target="_blank"
            >
              {shareUrl}
            </a>
          </div>
          <button
            className="flex-shrink-0 flex items-center text-emerald-400 dark:text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors"
            onClick={() => setIsModalOpen(false)}
          >
            <span className="i-mdi-close w-5 h-5" />
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <div className="py-8 px-4">
          <div className="max-w-6xl mx-auto">
            {/* ヘッダーセクション */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm dark:shadow-black/30 border border-slate-200 dark:border-slate-700 p-4 mb-6">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    言語:
                  </label>
                  <input
                    type="text"
                    name="language"
                    placeholder="javascript"
                    className="border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg px-3 py-2 w-32 text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  />
                </div>

                <button
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 dark:from-blue-600 dark:to-indigo-700 dark:hover:from-blue-500 dark:hover:to-indigo-600 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 font-medium"
                  onClick={addCode}
                >
                  <span className="i-mdi-share-variant w-5 h-5" />
                  共有
                </button>

                <button
                  className="flex items-center justify-center w-10 h-10 rounded-lg border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 transition-all duration-200"
                  onClick={toggleTheme}
                  aria-label={
                    isDarkMode ? "ライトモードに切り替え" : "ダークモードに切り替え"
                  }
                  title={
                    isDarkMode ? "ライトモードに切り替え" : "ダークモードに切り替え"
                  }
                >
                  <span
                    className={
                      (isDarkMode ? "i-mdi-weather-sunny" : "i-mdi-weather-night") +
                      " w-5 h-5"
                    }
                  />
                </button>
              </div>
            </div>

            {/* エディターセクション */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm dark:shadow-black/30 border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
              </div>

              <Editor
                height="75vh"
                language={language}
                value={code}
                theme={isDarkMode ? "vs-dark" : "light"}
                onChange={(value) => setCode(value ?? "")}
                options={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  padding: { top: 16, bottom: 16 },
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
