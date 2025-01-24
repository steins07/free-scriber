import { ITranslationType } from "../types/allTypes"
import { LANGUAGES } from "../utils/presets"

function Translation({
  textElement,
  translating,
  toLanguage,
  setToLanguage,
  generateTranslation }: ITranslationType) {
 
  return (
    <div className="flex flex-col gap-2 max-w-[400px] w-full mx-auto">
      {!translating && (<div className="flex flex-col gap-1 ">
        <p className="text-xs sm:text-sm font-medium text-slate-500 mr-auto">
          To Language
        </p>
        <div className="flex items-stretch gap-2">
          <select className="flex-1 outline-none bg-white border border-solid border-transparent hover:border-blue-300 duration-200 focus:outline-none p-2 rounded" value={toLanguage} onChange={(e) => setToLanguage(e.target.value)}>
            <option value={'Select Language'}>
              Select Language
            </option>
            {
              Object.entries(LANGUAGES).map((key, value) => {
                return (
                  <option key={value} value={key[1]}>
                    {key[0]}
                  </option>
                )
              })
            }
          </select>
          <button className="specialBtn px-3 py-2 rounded-lg text-blue-400 hover:text-blue-600 duration-200"
            onClick={generateTranslation}>Translate</button>
        </div>
      </div>)}
      {textElement && !translating && (
        <p>{textElement}</p>
      )}
      {translating && (
        <div className="grid place-items-center">
          <i className="fa-solid fa-spinner animate-spin"></i>
        </div>
      )}
    </div>
  )
}

export default Translation