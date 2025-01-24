export interface IOutputItem{
    end: number;
    index: number;
    start: number;
    text: string;
}

export interface IInformationType{
output: IOutputItem[];
}

export interface IFileDisplayPropType {
    handleAudioReset: () => void;
    handleFormSubmission: () => void;
    file: File | null;
}
export interface ITranscribingType {
    downloading: boolean;
}
export interface ITranscriptionType {
    textElement: string;
}