import { pipeline, PipelineType ,env} from "@xenova/transformers";
import { MessageTypes } from "./presets";

env.allowLocalModels=false;
interface AudioData {
    data: ArrayBuffer;
    sampleRate: number;
}

interface ProgressCallbackData {
    status: string;
    file?: string;
    progress?: number;
    loaded?: number;
    total?: number;
}

interface ProcessChunk {
    chunk: Chunk;
    index: number;
    text?: string; 
    start?: number; 
    end?: number;
}
interface Chunk {
    text: string;
    timestamp: [number, number];
}

interface Beam {
    output_token_ids: number[];
}


class MyTranscriptionPipeline {
    static task: PipelineType = 'automatic-speech-recognition';
    static model = "openai/whisper-tiny.en";
    static instance: any = null;

    static async getInstance(
        progress_callback: (data: ProgressCallbackData) => void
    ): Promise<any> {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, undefined, { progress_callback });
        }
        return this.instance;
    }
}

self.addEventListener("message", async (event: MessageEvent) => {
    const { type, audio } = event.data;
    if (type === MessageTypes.INFERENCE_REQUEST) {
        await transcribe(audio as AudioData);
    }
});

async function transcribe(audio: AudioData): Promise<void> {
    sendLoadingMessage("loading");

    let pipelineInstance: any;

    try {
        pipelineInstance = await MyTranscriptionPipeline.getInstance(
            load_model_callback
        );
    } catch (err: unknown) {
        const error = err as Error;
        console.error(error.message);
        sendLoadingMessage("error");
        return;
    }

    sendLoadingMessage("success");

    const stride_length_s = 5;
    const generationTracker = new GenerationTracker(
        pipelineInstance,
        stride_length_s
    );

    await pipelineInstance(audio, {
        top_k: 0,
        do_sample: false,
        chunk_length: 30,
        stride_length_s,
        return_timestamps: true,
        callback_function:
            generationTracker.callbackFunction.bind(generationTracker),
        chunk_callback: generationTracker.chunkCallback.bind(generationTracker),
    });

    generationTracker.sendFinalResult();
}

async function load_model_callback(data: ProgressCallbackData): Promise<void> {
    if (
        data.status === "progress" &&
        data.file &&
        data.progress !== undefined &&
        data.loaded !== undefined &&
        data.total !== undefined
    ) {
        sendDownloadingMessage(data.file, data.progress, data.loaded, data.total);
    }
}

function sendLoadingMessage(status: string): void {
    self.postMessage({
        type: MessageTypes.LOADING,
        status,
    });
}

function sendDownloadingMessage(
    file: string,
    progress: number,
    loaded: number,
    total: number
): void {
    self.postMessage({
        type: MessageTypes.DOWNLOADING,
        file,
        progress,
        loaded,
        total,
    });
}

class GenerationTracker {
    private pipeline: any;
    private stride_length_s: number;
    private chunks: Chunk[];
    private time_precision: number;
    private processed_chunks: Array<{ text: string; start: number; end: number }>;
    private callbackFunctionCounter: number;

    constructor(pipeline: any, stride_length_s: number) {
        this.pipeline = pipeline;
        this.stride_length_s = stride_length_s;
        this.chunks = [];
        this.time_precision =
            pipeline?.processor.feature_extractor.config.chunk_length /
            pipeline.model.config.max_source_positions;
        this.processed_chunks = [];
        this.callbackFunctionCounter = 0;
    }

    sendFinalResult(): void {
        self.postMessage({ type: MessageTypes.INFERENCE_DONE });
    }

    callbackFunction(beams: Beam[]): void {
        this.callbackFunctionCounter += 1;
        if (this.callbackFunctionCounter % 10 !== 0) {
            return;
        }

        const bestBeam = beams[0];
        const text = this.pipeline.tokenizer.decode(bestBeam.output_token_ids, {
            skip_special_tokens: true,
        });

        const result = {
            text,
            start: this.getLastChunkTimestamp(),
            end: undefined,
        };

        createPartialResultMessage(result);
    }

    chunkCallback(data: Chunk): void {
        this.chunks.push(data);
        const [, { chunks }] = this.pipeline.tokenizer._decode_asr(
            this.chunks,
            {
                time_precision: this.time_precision,
                return_timestamps: true,
                force_full_sequence: false,
            }
        );

        this.processed_chunks = chunks.map((chunk:Chunk, index: number) =>
            this.processChunk({chunk, index})
        );

        createResultMessage(
            this.processed_chunks,
            false,
            this.getLastChunkTimestamp()
        );
    }

    private getLastChunkTimestamp(): number {
        if (this.processed_chunks.length === 0) {
            return 0;
        }
        return this.processed_chunks[this.processed_chunks.length - 1].end;
    }

    private processChunk(
        {chunk,
        index}:ProcessChunk
    ){
        const { text, timestamp } = chunk;
        const [start, end] = timestamp;

        return {
            index,
            text: text.trim(),
            start: Math.round(start),
            end: Math.round(end) || Math.round(start + 0.9 * this.stride_length_s),
        };
    }
}

function createResultMessage(
    results: Array<{ text: string; start: number; end: number }>,
    isDone: boolean,
    completedUntilTimestamp: number
): void {
    self.postMessage({
        type: MessageTypes.RESULT,
        results,
        isDone,
        completedUntilTimestamp,
    });
}

function createPartialResultMessage(result: {
    text: string;
    start: number;
    end: undefined;
}): void {
    self.postMessage({
        type: MessageTypes.RESULT_PARTIAL,
        result,
    });
}