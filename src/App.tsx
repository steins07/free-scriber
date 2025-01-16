import { useEffect, useState } from "react"
import Footer from "./components/Footer"
import Header from "./components/Header"
import Homepage from "./components/Homepage"
import FileDisplay from "./components/FileDisplay"


function App() {
  const [file, setFile] = useState<File | null>(null)
  const [audioStream, setAudioStream] = useState<Blob | null>(null)

  const isAudioAvailable = file || audioStream;

  useEffect(() => {
    console.log(audioStream);
  }, [audioStream])
  function handleAudioReset() {
    setFile(null);
    setAudioStream(null);
  }

  return (
    <>
      <div className="flex flex-col mx-auto w-full max-w-[1000px]">
        <section className="min-h-screen flex flex-col ">
          <Header />
          {isAudioAvailable ? (
            <FileDisplay handleAudioReset={handleAudioReset} file={file} audioStream={audioStream} />
          ) : (
            <Homepage setFile={setFile} setAudioStream={setAudioStream} />
          )}
        </section>
        <Footer />
      </div>
    </>
  )
}

export default App
