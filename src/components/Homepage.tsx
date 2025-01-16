type IHomepagePropType = {
    setAudioStream: (audioStream: MediaStream | null) => void;
    setFile: (file: File | null) => void
}

export default function Homepage({ setAudioStream, setFile }: IHomepagePropType) {
    return (
        <main
            className="flex-1 flex flex-col justify-center p-4 gap-3 sm:gap-4 md:gap-5 text-center pb-20 "
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

            <button className="flex text-center text-base justify-between gap-4 mx-auto w-72 max-w-full my-4 specialBtn px-4 py-2 rounded-xl">
                <p className="text-blue-400">Record</p>
                <i className="fa-solid fa-microphone"></i>
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
            <p className="italic text-slate-500">Start Free, Enjoy Forever!</p>
        </main>
    )
}
