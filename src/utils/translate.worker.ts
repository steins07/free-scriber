import { pipeline, env, PipelineType } from "@xenova/transformers";

env.allowLocalModels = false;
class MyTranslationPipeline {
    static task: PipelineType = "translation";
    static model = "Xenova/nllb-200-distilled-600M";
    static instance: any = null;

    static async getInstance(progress_callback: (progress: any) => void) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model, {
                progress_callback,
            });
        }
        return this.instance;
    }
}

self.addEventListener("message", async (event: MessageEvent) => {
    // Define the structure of the event data
    const data = event.data as {
        text: string;
        tgt_language: string;
        src_language: string;
    };

    let translator = await MyTranslationPipeline.getInstance((x) => {
        self.postMessage(x);
    });
    let output = await translator(event.data.text, {
        tgt_lang: data.tgt_language,
        src_lang: data.src_language,
        callback_function: (x: any) => {
            self.postMessage({
                status: "update",
                output: translator.tokenizer.decode(x[0].output_token_ids, {
                    skip_special_tokens: true,
                }),
            });
        },
    });

    self.postMessage({
        status: "complete",
        output,
    });
});