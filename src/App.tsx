import { useEffect, useRef, useState } from "react"
import Footer from "./components/Footer"
import Header from "./components/Header"
import Homepage from "./components/Homepage"
import FileDisplay from "./components/FileDisplay"
import Information from "./components/Information"
import Transcribing from "./components/Transcribing"
import { MessageTypes } from "./utils/presets"
import { IOutputItem } from "./types/allTypes"


function App() {
  const [file, setFile] = useState<File | null>(null);
  const [audioStream, setAudioStream] = useState<Blob | null>(null);
  const [output, setOutput] = useState<IOutputItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);

  const [downloading, setDownloading] = useState<boolean>(false);

  const isAudioAvailable = file || audioStream;

  const worker = useRef<Worker | null>(null);

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL('./utils/whisper.worker.ts', import.meta.url), { type: 'module' });
    }

    const onMessageRecieved = async (event: MessageEvent) => {
      switch (event.data.type) {
        case 'DOWNLOADING':
          setDownloading(true);
          console.log('Downloading...');
          break;
        case 'LOADING':
          setLoading(true);
          console.log('Loading...');
          break;
        case 'RESULT':
          setOutput(event.data.results);
          console.log('Downloading...');
          console.log(event.data.results);

          break;
        case 'INFERENCE_DONE':
          setFinished(true);
          console.log('Done');

          if (finished) {
            setFinished(false);
          }
          break;
      }
    }
    worker.current.addEventListener('message', onMessageRecieved);
    return () => {
      worker.current?.removeEventListener('message', onMessageRecieved);
    }
  });

  async function readAudioFrom(file: File | Blob | null) {
    const sampling_rate = 16000;
    const autioCTx = new AudioContext({ sampleRate: sampling_rate });
    const response = await file?.arrayBuffer();
    const decoded = await autioCTx.decodeAudioData(response!);
    const audio = decoded.getChannelData(0);
    return audio;

  }
  async function handleFormSubmission() {
    if (!file && !audioStream) {
      return
    }
    let audio = await readAudioFrom(file ? file : audioStream)
    const model_name = 'openai/whisper-tiny.en';
    worker.current?.postMessage({
      type: MessageTypes.INFERENCE_REQUEST,
      audio,
      model_name
    });
  }



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
            <Information output={output} />) : (
            loading ? (
              <Transcribing downloading={downloading} />) : (
              isAudioAvailable ? (
                <FileDisplay handleFormSubmission={handleFormSubmission} handleAudioReset={handleAudioReset} file={file} />
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
