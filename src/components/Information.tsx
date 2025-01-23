import { useEffect, useRef, useState } from "react"
import Transcription from "./Transcription"
import Translation from "./Translation"

export default function Information(props) {
    const { output } = props
    const [tab, setTab] = useState('transcription')
    const [translation, setTranslation] = useState(null)
    const [translating, setTranslating] = useState(false)
    const [toLanguage, setToLanguage] = useState('Select Language')
    const worker = useRef<Worker>()

    const textElement = tab === 'transcription' ? output.map((val:any) => val.text) : translation||'No Translation Available';
    console.log(textElement);

    useEffect(() => {
        if (!worker.current) {
            worker.current = new Worker(new URL('../utils/translate.worker.ts', import.meta.url), { type: 'module' });
        }
        const onMessageRecieved = async (event: MessageEvent) => {
            switch (event.data.status) {
                case 'initiate':
                    console.log('Downloading...');
                    break;
                case 'progress':
                    console.log('Loading...');
                    break;
                case 'update':
                    setTranslation(event.data.output);
                    console.log(event.data.output);
                    break;
                case 'complete':
                    setTranslating(false);
                    console.log('Done');
                    break;
            }
        }
        worker.current.addEventListener('message', onMessageRecieved);
        return () => {
            worker.current?.removeEventListener('message', onMessageRecieved);
        }
    })


    function handleCopy() {
        navigator.clipboard.writeText(textElement)
    }
    function handleDownload() {
        const element = document.createElement('a');
        const file = new Blob([textElement], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = (`FreeScriber_${(new Date()).toDateString()}.txt`);
        document.body.appendChild(element);
        element.click();
    }

    function generateTranslation() {
        if (translating || toLanguage === 'Select Language') {
            return;
        }
        setTranslating(true);
        if (worker.current) {
            worker.current.postMessage({
                text: output.map(val => val.text),
                src_language: 'eng_Latn',
                tgt_language: toLanguage,
            })
        }

    }

    return (
        <main
            className="flex-1 flex flex-col justify-center p-4 gap-3 sm:gap-4 text-center pb-20  max-w-prose w-full mx-auto"
        >
            <h1 className="font-semibold text-4xl sm:text-5xl md:text-6xl whitespace-nowrap">
                Your <span className="text-blue-400 bold">Transcription</span>
            </h1>
            <div className="grid grid-cols-2 mx-auto bg-white shadow-md rounded-full overflow-hidden items-center">
                <button
                    className={`px-4 py-1 duration-200 ${tab === 'transcription' ? ' bg-blue-300 text-white' : 'text-blue-400 hover:text-blue-600'}`}
                    onClick={() => setTab('transcription')}>
                    Transcription
                </button>
                <button className={'px-4 py-1 duration-200 ' + (tab === 'translation' ? ' bg-blue-300 text-white' : 'text-blue-400 hover:text-blue-600')}
                    onClick={() => setTab('translation')}>
                    Translation
                </button>
            </div>
            <div className="my-8 flex flex-col">
                {
                    tab === 'transcription' ? <Transcription textElement={textElement} {...props} /> : <Translation {...props}
                        textElement={textElement} translating={translating} toLanguage={toLanguage} setToLanguage={setToLanguage} generateTranslation={generateTranslation} />
                }
            </div>
            <div className="flex items-center gap-4 mx-auto">
                <button onClick={handleCopy} title="Copy" className=" bg-white/90 text-blue-400 px-2 aspect-square grid place-items-center rounded hover:text-blue-500 duration-200  ">
                    <i className="fa-solid fa-copy"></i>
                </button>
                <button onClick={handleDownload} title="Download" className="bg-white/90 text-blue-400 p-2 aspect-square grid place-items-center rounded  hover:text-blue-500 duration-200 " >
                    <i className="fa-solid fa-download"></i>
                </button>
            </div>
        </main >
    )
}
