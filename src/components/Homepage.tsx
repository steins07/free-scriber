import React, { useEffect, useRef, useState } from "react";

type IHomepagePropType = {
    // setAudioStream: (audioStream:  null | Blob) => void;

    // setFile: (file: File | null) => void
    setAudioStream: React.Dispatch<React.SetStateAction<Blob | null>>
    setFile: React.Dispatch<React.SetStateAction<File | null>>
}

export default function Homepage({ setAudioStream, setFile }: IHomepagePropType) {

    const [recordingStatus, setRecordingStatus] = useState<string>("inactive");
    const [audioChunck, setAudioChunck] = useState<Blob[]>([]);
    const [duration, setDuration] = useState<number>(0);

    const mediaRecorder = useRef<MediaRecorder | null>(null);

    const mimeType: string = "audio/webm";

    async function startRecording() {
        let tempStream;
        console.log("start recording");
        try {
            const streamData = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false,
            })
            tempStream = streamData;

        } catch (error) {
            console.log(error);
            return;
        }
        setRecordingStatus("recording");
        // create media recorder instance using stream
        const media = new MediaRecorder(tempStream, { mimeType: mimeType })
        mediaRecorder.current = media;
        mediaRecorder.current.start();
        mediaRecorder.current.onstart = () => {
            console.log("recorder started");
        }
        let localAudioChunck: Blob[] = [];
        mediaRecorder.current.ondataavailable = (event) => {
            if (typeof event.data === "undefined" || event.data.size === 0) {
                return;
            }
            localAudioChunck.push(event.data);
        }
        setAudioChunck(localAudioChunck);
    }

    async function stopRecording() {
        setRecordingStatus("inactive");
        console.log("stop recording");
        if (mediaRecorder.current) {
            mediaRecorder.current.stop();
            mediaRecorder.current.onstop = () => {
                const audioBlob: Blob = new Blob(audioChunck, { type: mimeType });
                setAudioStream(audioBlob)
                setAudioChunck([]);
                setDuration(0);
                console.log("recorder stopped");
            }
        }

    }
    useEffect(() => {
        if (recordingStatus === "inactive") {
            return;
        }
        const interval = setInterval(() => {
            setDuration(cur => cur + 1)
        }, 1000)
        return () => clearInterval(interval)
    })


    return (
        <main
            className="flex-1 flex flex-col justify-center p-4 gap-3 sm:gap-4 text-center pb-20 "
        >
            <h1 className="font-semibold text-5xl sm:text-6xl md:text-7xl">
                Free
                <span className="text-blue-400 bold">Scriber</span>
            </h1>
            <h3 className="font-medium md:text-lg">
                Record <span className="text-blue-400">
                    &rarr;
                </span> Transcribe <span className="text-blue-400">
                    &rarr;
                </span> Translate
            </h3>

            <button className="flex text-center text-base justify-between gap-4 mx-auto w-72 max-w-full my-4 specialBtn px-4 py-2 rounded-xl"
                onClick={recordingStatus === "recording" ? stopRecording : startRecording}
            >
                <p className="text-blue-400">{recordingStatus === "inactive" ?
                    'Record' : `Stop recording`
                }</p>
                <div className="flex items-center gap-2">
                    {duration !== 0 && <p
                        className="text-sm"
                    >
                        {duration}s</p>}
                    <i className={`fa-solid fa-microphone duration-200 ${recordingStatus === "recording" ? "text-rose-300" : ""}`}></i>
                </div>
            </button>
            <p>Or&nbsp;
                <label className="text-blue-400 cursor-pointer hover:text-blue-600 duration-200">
                    Upload
                    <input
                        className="hidden" type="file" accept=".mp3,.wav"
                        onChange={(e) => {
                            const tempFile = e.target.files?.[0];
                            if (tempFile) {
                                setFile(tempFile)
                            };
                        }} />
                </label> mp3 file
            </p>
            <p className="italic text-slate-400">Start Free, Enjoy Forever!</p>
        </main>
    )
}
