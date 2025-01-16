
interface IFileDisplayPropType {
    handleAudioReset: () => void;
    file: File | null;
    audioStream: MediaStream | null;
}
export default function FileDisplay({ handleAudioReset, file, audioStream }:IFileDisplayPropType) {
    return (
        <main
            className="flex-1 flex flex-col justify-center p-4 gap-3 sm:gap-4 md:gap-5 text-center pb-20 w-fit max-w-full mx-auto "
        >
            <h1 className="font-semibold text-4xl sm:text-5xl md:text-6xl">
                Your <span className="text-blue-400 bold">File</span>
            </h1>
            <div className="flex flex-col text-left mx-auto mb-4">
                <h3 className="font-semibold">Name</h3>
                <p>{file?.name}</p>
            </div>
            <div
                className="flex items-center justify-between gap-4"
            >
                <button className="text-slate-400"
                    onClick={handleAudioReset}
                >Reset</button>_
                <button className="specialBtn px-4 py-2 rounded-lg text-blue-400">
                    <p>Transcribe</p>
                </button>
            </div>
        </main>
    )
}
