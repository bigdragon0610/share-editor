import Editor from '@monaco-editor/react'
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore'
import { useEffect, useRef, useState } from 'react'
import { db } from './firebase/firebase'

function App() {
  const DEFAULT_LANGUAGE = 'javascript'
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE)
  const [code, setCode] = useState("console.log('Hello, world!')")
  const docId = useRef<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const addCode = async () => {
    try {
      if (docId.current) {
        await updateDoc(doc(db, 'documents', docId.current), {
          language,
          code,
        })
        navigator.clipboard.writeText(
          window.location.origin + '?id=' + docId.current
        )
        setIsModalOpen(true)
        setTimeout(() => {
          setIsModalOpen(false)
        }, 5000)
        return
      }
      const docRef = await addDoc(collection(db, 'documents'), {
        language,
        code,
      })
      docId.current = docRef.id
      navigator.clipboard.writeText(
        window.location.origin + '?id=' + docId.current
      )
      setIsModalOpen(true)
      setTimeout(() => {
        setIsModalOpen(false)
      }, 5000)
    } catch (e) {
      console.error('Error adding document: ', e)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('id')
    const getCode = async (id: string | null) => {
      if (!id) return
      const docSnap = await getDoc(doc(db, 'documents', id))
      if (docSnap.exists()) {
        const data = docSnap.data()
        if (data) {
          setLanguage(data.language)
          setCode(data.code)
        }
      }
    }
    getCode(id)
  }, [])

  return (
    <>
      <div
        className={
          (isModalOpen ? 'opacity-100 top-2' : 'opacity-0 -top-2 invisible') +
          ' transition-all duration-500 absolute z-50 w-[calc(100%-2.5rem)] left-1/2 -translate-x-1/2 bg-blue-100 border-t-4 border-blue-500 rounded-b text-blue-900 px-4 py-3 shadow-md'
        }
        role='alert'
      >
        <p className='font-bold flex items-center'>
          <span>URLがコピーされました</span>
          <button
            className='i-mdi-close w-5 h-5 inline-block ml-auto'
            onClick={() => setIsModalOpen(false)}
          />
        </p>
        <a
          className='text-sm underline underline-blue-500'
          href={window.location.origin + '?id=' + docId.current}
          target='_blank'
        >
          {window.location.origin + '?id=' + docId.current}
        </a>
      </div>
      <div className='py-10 px-5'>
        <div className='max-w-6xl mx-auto'>
          <div className='flex items-center'>
            <label>
              <span>lang: </span>
              <input
                type='text'
                name='language'
                className='border-2 rounded-sm px-1 w-32'
                defaultValue={DEFAULT_LANGUAGE}
                onChange={(e) => setLanguage(e.target.value)}
              />
            </label>
            <button
              className='i-mdi-export-variant w-7 h-7 inline-block text-gray-500 ml-auto'
              onClick={addCode}
            />
          </div>
          <Editor
            className='mt-5 border-2'
            height='85svh'
            defaultLanguage={DEFAULT_LANGUAGE}
            language={language}
            value={code}
            onChange={(value) => setCode(value ?? '')}
          />
        </div>
      </div>
    </>
  )
}

export default App
