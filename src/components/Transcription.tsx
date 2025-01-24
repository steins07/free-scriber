import { ITranscriptionType } from "../types/allTypes";

function Transcription({textElement}:ITranscriptionType) {
  console.log("form Transcription", textElement)
  return (
    <div>{textElement}</div>
  )
}

export default Transcription;