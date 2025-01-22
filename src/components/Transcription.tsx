
function Transcription(props) {
  const {output}=props
  const TranscribedText= output.map(val=>val.text)
  return (
    <div>{TranscribedText}</div>
  )
}

export default Transcription;