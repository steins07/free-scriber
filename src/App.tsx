import { useEffect, useRef, useState } from "react"
import Footer from "./components/Footer"
import Header from "./components/Header"
import Homepage from "./components/Homepage"
import FileDisplay from "./components/FileDisplay"
import Information from "./components/Information"
import Transcribing from "./components/Transcribing"


function App() {
  const [file, setFile] = useState<File | null>(null);
  const [audioStream, setAudioStream] = useState<Blob | null>(null);
  // const[output,setOutput] = useState<Blob | null>(null);
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [finished,setFinished] = useState<boolean>(false);

  const isAudioAvailable = file || audioStream;

  const worker= useRef<Worker | null>(null);

  useEffect(() => {
    
  });
  
  function handleAudioReset() {
    setFile(null);
    setAudioStream(null);
  }

  return (
    <>
      <div className="flex flex-col mx-auto w-full max-w-[1000px]">
        <section className="min-h-screen flex flex-col ">
          <Header />
          {output ? (
            <Information />) : (
            isLoading ? (
              <Transcribing />) : (
              isAudioAvailable ? (
                <FileDisplay handleAudioReset={handleAudioReset} file={file} audioStream={audioStream} />
              ) : (
                <Homepage setFile={setFile} setAudioStream={setAudioStream} />
              )))}
          { }
        </section>
        <Footer />
      </div>
    </>
  )
}

export default App
